import json
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from backend.models import db, User, Track, Module, Lesson, Question, QuizAttempt, StudentProgress
from backend.routes.auth import token_required

learning_bp = Blueprint('learning', __name__)

@learning_bp.route('/tracks', methods=['GET'])
@token_required
def get_tracks(current_user):
    tracks = Track.query.order_by(Track.id).all()
    
    # We want to provide completion status for each lesson based on current student's progress
    completed_lessons = []
    if current_user.role == 'student':
        progress = StudentProgress.query.filter_by(user_id=current_user.id).first()
        if progress and progress.completed_lessons:
            completed_lessons = json.loads(progress.completed_lessons)
            
    track_list = []
    for t in tracks:
        modules_list = []
        for m in t.modules.order_by(Module.order_index).all():
            lessons_list = []
            for l in m.lessons.order_by(Lesson.order_index).all():
                lessons_list.append({
                    "id": l.id,
                    "title": l.title,
                    "order_index": l.order_index,
                    "xp_reward": l.xp_reward,
                    "completed": l.id in completed_lessons
                })
            modules_list.append({
                "id": m.id,
                "title": m.title,
                "order_index": m.order_index,
                "lessons": lessons_list
            })
        track_list.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "category": t.category,
            "modules": modules_list
        })
        
    return jsonify({"tracks": track_list}), 200

@learning_bp.route('/lessons/<int:lesson_id>', methods=['GET'])
@token_required
def get_lesson(current_user, lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)
    module = lesson.module
    track = module.track if module else None
    
    # Check completion
    completed = False
    if current_user.role == 'student':
        progress = StudentProgress.query.filter_by(user_id=current_user.id).first()
        if progress and progress.completed_lessons:
            completed = lesson.id in json.loads(progress.completed_lessons)
            
    return jsonify({
        "lesson": {
            "id": lesson.id,
            "title": lesson.title,
            "content": lesson.content,
            "xp_reward": lesson.xp_reward,
            "completed": completed,
            "track_title": track.title if track else "English Mastery",
            "module_title": module.title if module else "General",
            "questions": [q.to_dict() for q in lesson.questions.all()]
        }
    }), 200

@learning_bp.route('/quizzes/submit', methods=['POST'])
@token_required
def submit_quiz(current_user):
    if current_user.role != 'student':
        return jsonify({"message": "Only students can submit quiz results"}), 403
        
    data = request.get_json()
    if not data or not data.get('lesson_id'):
        return jsonify({"message": "Missing lesson ID or responses"}), 400
        
    lesson_id = int(data.get('lesson_id'))
    score = int(data.get('score', 0))
    total_questions = int(data.get('total_questions', 1))
    time_taken = int(data.get('time_taken', 60)) # seconds
    wrong_answers = data.get('wrong_answers', []) # list of strings or dicts containing topics/question types
    
    lesson = Lesson.query.get_or_404(lesson_id)
    
    # Calculate accuracy
    accuracy = float(score) / float(total_questions) if total_questions > 0 else 0.0
    
    # Calculate XP Earned
    # Base XP = accuracy * lesson reward
    base_xp = int(accuracy * lesson.xp_reward)
    bonus_xp = 0
    if accuracy == 1.0:
        bonus_xp = 5 # perfect score bonus
    
    xp_earned = base_xp + bonus_xp
    
    # 1. Update User global XP
    current_user.xp += xp_earned
    
    # 2. Update Streak
    progress = StudentProgress.query.filter_by(user_id=current_user.id).first()
    if not progress:
        progress = StudentProgress(user_id=current_user.id)
        db.session.add(progress)
        
    today = date.today()
    today_str = today.strftime('%Y-%m-%d')
    
    # Check last activity date
    if progress.last_activity_date:
        last_date = datetime.strptime(progress.last_activity_date, '%Y-%m-%d').date()
        delta = today - last_date
        
        if delta.days == 1:
            # Active yesterday! Increment streak
            current_user.streak += 1
            progress.current_streak = current_user.streak
        elif delta.days > 1:
            # Broke streak! Reset to 1
            current_user.streak = 1
            progress.current_streak = 1
        elif current_user.streak == 0:
            # First time playing
            current_user.streak = 1
            progress.current_streak = 1
        # If delta.days == 0 (already active today), streak remains unchanged
    else:
        # First active day
        current_user.streak = 1
        progress.current_streak = 1
        
    progress.last_activity_date = today_str
    
    # 3. Update Completed Lessons list
    completed = json.loads(progress.completed_lessons) if progress.completed_lessons else []
    if lesson_id not in completed:
        completed.append(lesson_id)
        progress.completed_lessons = json.dumps(completed)
        
    # 4. Update total progress XP
    progress.total_xp = current_user.xp
    
    # 5. Update Weak Topics frequency
    # We analyze which questions were missed. Let's record in progress.
    weak_topics_dict = json.loads(progress.weak_topics) if progress.weak_topics else {}
    for wrong in wrong_answers:
        # 'wrong' is the topic title or question type, e.g. "Simple Present"
        weak_topics_dict[wrong] = weak_topics_dict.get(wrong, 0) + 1
        
    # Also if accuracy is low (< 0.7), add the general lesson category/track as a weak area
    if accuracy < 0.7:
        category = lesson.module.track.category if (lesson.module and lesson.module.track) else "General English"
        weak_topics_dict[category] = weak_topics_dict.get(category, 0) + 1
        
    progress.weak_topics = json.dumps(weak_topics_dict)
    
    # Save the quiz attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        lesson_id=lesson_id,
        score=score,
        accuracy=accuracy,
        xp_earned=xp_earned,
        time_taken=time_taken
    )
    db.session.add(attempt)
    db.session.commit()
    
    return jsonify({
        "message": "Quiz submitted successfully",
        "xp_earned": xp_earned,
        "base_xp": base_xp,
        "bonus_xp": bonus_xp,
        "new_streak": current_user.streak,
        "accuracy": accuracy,
        "total_xp": current_user.xp,
        "completed": lesson_id in completed
    }), 200
