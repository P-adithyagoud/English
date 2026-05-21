import json
from flask import Blueprint, request, jsonify
from backend.models import db, User, StudentProgress, QuizAttempt, Lesson, Track
from backend.routes.auth import token_required

student_bp = Blueprint('student', __name__)

@student_bp.route('/onboarding', methods=['POST'])
@token_required
def save_onboarding(current_user):
    if current_user.role != 'student':
        return jsonify({"message": "Only students can complete onboarding"}), 403
        
    data = request.get_json()
    if not data:
        return jsonify({"message": "No onboarding data provided"}), 400
        
    # Update user details
    current_user.name = data.get('name', current_user.name)
    current_user.english_level = data.get('english_level')
    current_user.confidence_level = int(data.get('confidence_level', 1))
    current_user.weak_areas = data.get('weak_areas', [])
    current_user.learning_style = data.get('learning_style')
    current_user.daily_goal = data.get('daily_goal')
    
    # Map preparation choice to learning_goal
    prep_goal = data.get('preparing_for') # e.g. "Interview Preparation"
    current_user.learning_goal = prep_goal
    
    db.session.commit()
    
    # Initialize or sync student progress record
    progress = StudentProgress.query.filter_by(user_id=current_user.id).first()
    if not progress:
        progress = StudentProgress(user_id=current_user.id)
        db.session.add(progress)
    
    # Synchronize stats
    progress.total_xp = current_user.xp
    progress.current_streak = current_user.streak
    db.session.commit()
    
    return jsonify({
        "message": "Onboarding completed successfully",
        "user": current_user.to_dict()
    }), 200

@student_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard(current_user):
    if current_user.role != 'student':
        return jsonify({"message": "Only students have access to the student dashboard"}), 403
        
    progress = StudentProgress.query.filter_by(user_id=current_user.id).first()
    if not progress:
        progress = StudentProgress(user_id=current_user.id)
        db.session.add(progress)
        db.session.commit()
        
    # Fetch quiz attempts for statistics
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).all()
    total_attempts = len(attempts)
    
    # Calculate average accuracy
    avg_accuracy = 0.0
    if total_attempts > 0:
        avg_accuracy = sum(att.accuracy for att in attempts) / total_attempts
        
    # Get all users sorted by XP to calculate Leaderboard Rank
    leaderboard = User.query.filter_by(role='student').order_by(User.xp.desc()).all()
    user_rank = 1
    for index, u in enumerate(leaderboard):
        if u.id == current_user.id:
            user_rank = index + 1
            break
            
    # Compile dynamic achievements based on real stats
    achievements = []
    if current_user.xp > 0:
        achievements.append({
            "id": "first_steps",
            "title": "First Steps",
            "description": "Earned your first XP points on FluentFlow!",
            "badge": "🎯",
            "unlocked": True
        })
    if current_user.streak >= 7:
        achievements.append({
            "id": "week_warrior",
            "title": "Week Warrior",
            "description": "Maintained a streak of 7+ days!",
            "badge": "🔥",
            "unlocked": True
        })
    else:
        achievements.append({
            "id": "week_warrior",
            "title": "Week Warrior",
            "description": "Maintain a streak of 7+ days",
            "badge": "🔥",
            "unlocked": False
        })
        
    any_perfect = any(att.accuracy == 1.0 for att in attempts)
    if any_perfect:
        achievements.append({
            "id": "flawless_victory",
            "title": "Flawless Score",
            "description": "Completed a quiz with 100% accuracy!",
            "badge": "💎",
            "unlocked": True
        })
    else:
        achievements.append({
            "id": "flawless_victory",
            "title": "Flawless Score",
            "description": "Complete a quiz with 100% accuracy",
            "badge": "💎",
            "unlocked": False
        })

    if total_attempts >= 5:
        achievements.append({
            "id": "knowledge_seeker",
            "title": "Knowledge Seeker",
            "description": "Completed 5 lessons and quizzes!",
            "badge": "📚",
            "unlocked": True
        })
    else:
        achievements.append({
            "id": "knowledge_seeker",
            "title": "Knowledge Seeker",
            "description": "Complete 5 lessons and quizzes",
            "badge": "📚",
            "unlocked": False
        })
        
    # Personalize recommended next lesson
    # We find what track matches their learning_goal
    recommended_track = None
    goal_mapping = {
        "Learning English": "Grammar Foundations",
        "Interview Preparation": "Interview Communication",
        "IELTS Preparation": "IELTS Preparation",
        "Communication Improvement": "Spoken English",
        "Placement Preparation": "Interview Communication"
    }
    
    target_track_title = goal_mapping.get(current_user.learning_goal, "Grammar Foundations")
    target_track = Track.query.filter_by(title=target_track_title).first()
    
    recommended_lesson = None
    completed_ids = progress.completed_lessons if progress.completed_lessons else []
    
    if target_track:
        # Get lessons in this track
        for module in target_track.modules:
            for lesson in module.lessons.order_by(Lesson.order_index).all():
                if lesson.id not in completed_ids:
                    recommended_lesson = {
                        "id": lesson.id,
                        "title": lesson.title,
                        "track_title": target_track.title,
                        "module_title": module.title,
                        "xp_reward": lesson.xp_reward
                    }
                    break
            if recommended_lesson:
                break
                
    # Fallback to any incomplete lesson if target track is finished or not found
    if not recommended_lesson:
        all_lessons = Lesson.query.order_by(Lesson.id).all()
        for lesson in all_lessons:
            if lesson.id not in completed_ids:
                module = lesson.module
                track = module.track if module else None
                recommended_lesson = {
                    "id": lesson.id,
                    "title": lesson.title,
                    "track_title": track.title if track else "English Mastery",
                    "module_title": module.title if module else "General",
                    "xp_reward": lesson.xp_reward
                }
                break
                
    # If all lessons completed
    if not recommended_lesson and all_lessons:
        # Suggest the first lesson for revision
        first = all_lessons[0]
        recommended_lesson = {
            "id": first.id,
            "title": first.title + " (Revision)",
            "track_title": first.module.track.title if first.module and first.module.track else "English Mastery",
            "module_title": first.module.title if first.module else "General",
            "xp_reward": first.xp_reward // 2
        }

    # Format history
    history = [att.to_dict() for att in attempts[-10:]] # last 10 attempts
    
    return jsonify({
        "progress": progress.to_dict(),
        "total_attempts": total_attempts,
        "average_accuracy": avg_accuracy,
        "leaderboard_rank": user_rank,
        "achievements": achievements,
        "recommended_lesson": recommended_lesson,
        "quiz_history": history
    }), 200

@student_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard(current_user):
    students = User.query.filter_by(role='student').order_by(User.xp.desc()).all()
    
    records = []
    for i, s in enumerate(students):
        records.append({
            "rank": i + 1,
            "id": s.id,
            "name": s.name,
            "xp": s.xp,
            "streak": s.streak,
            "learning_goal": s.learning_goal,
            "english_level": s.english_level
        })
        
    return jsonify({
        "leaderboard": records
    }), 200
