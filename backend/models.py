import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50), nullable=False) # 'student' or 'faculty'
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(500), nullable=False)
    learning_goal = db.Column(db.String(100), nullable=True)
    english_level = db.Column(db.String(100), nullable=True)
    confidence_level = db.Column(db.Integer, default=1)
    weak_areas = db.Column(db.Text, nullable=True) # JSON array or comma list
    learning_style = db.Column(db.String(100), nullable=True)
    daily_goal = db.Column(db.String(100), nullable=True)
    streak = db.Column(db.Integer, default=0)
    xp = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    progress = db.relationship('StudentProgress', backref='user', uselist=False, cascade="all, delete-orphan")
    quiz_attempts = db.relationship('QuizAttempt', backref='user', lazy='dynamic', cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "name": self.name,
            "email": self.email,
            "learning_goal": self.learning_goal,
            "english_level": self.english_level,
            "confidence_level": self.confidence_level,
            "weak_areas": json.loads(self.weak_areas) if self.weak_areas else [],
            "learning_style": self.learning_style,
            "daily_goal": self.daily_goal,
            "streak": self.streak,
            "xp": self.xp,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Track(db.Model):
    __tablename__ = 'tracks'
    
    id = db.Model.metadata.tables.get('tracks') # Avoid collision
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=True)
    
    modules = db.relationship('Module', backref='track', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "modules": [m.to_dict(include_lessons=False) for m in self.modules]
        }

class Module(db.Model):
    __tablename__ = 'modules'
    
    id = db.Column(db.Integer, primary_key=True)
    track_id = db.Column(db.Integer, db.ForeignKey('tracks.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order_index = db.Column(db.Integer, default=0)
    
    lessons = db.relationship('Lesson', backref='module', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self, include_lessons=True):
        data = {
            "id": self.id,
            "track_id": self.track_id,
            "title": self.title,
            "order_index": self.order_index
        }
        if include_lessons:
            data["lessons"] = [l.to_dict(include_questions=False) for l in self.lessons.order_by(Lesson.order_index).all()]
        return data

class Lesson(db.Model):
    __tablename__ = 'lessons'
    
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False) # Markdown curriculum
    order_index = db.Column(db.Integer, default=0)
    xp_reward = db.Column(db.Integer, default=15)
    
    questions = db.relationship('Question', backref='lesson', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self, include_questions=True):
        data = {
            "id": self.id,
            "module_id": self.module_id,
            "title": self.title,
            "content": self.content,
            "order_index": self.order_index,
            "xp_reward": self.xp_reward
        }
        if include_questions:
            data["questions"] = [q.to_dict() for q in self.questions.all()]
        return data

class Question(db.Model):
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'mcq', 'fill_in_the_blank', 'sentence_correction', 'vocabulary', 'scenario'
    options = db.Column(db.Text, nullable=True) # JSON-encoded list of strings (MCQ options)
    correct_answer = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "lesson_id": self.lesson_id,
            "question": self.question,
            "type": self.type,
            "options": json.loads(self.options) if self.options else [],
            "correct_answer": self.correct_answer,
            "explanation": self.explanation
        }

class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    accuracy = db.Column(db.Float, nullable=False)
    xp_earned = db.Column(db.Integer, default=0)
    time_taken = db.Column(db.Integer, nullable=False) # in seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        lesson = Lesson.query.get(self.lesson_id)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "lesson_id": self.lesson_id,
            "lesson_title": lesson.title if lesson else "Unknown Lesson",
            "score": self.score,
            "accuracy": self.accuracy,
            "xp_earned": self.xp_earned,
            "time_taken": self.time_taken,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class StudentProgress(db.Model):
    __tablename__ = 'student_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    completed_lessons = db.Column(db.Text, default='[]') # JSON list of integer IDs
    total_xp = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    weak_topics = db.Column(db.Text, default='{}') # JSON frequency dictionary (e.g. {"Present Perfect": 3})
    last_activity_date = db.Column(db.String(50), default=lambda: datetime.utcnow().strftime('%Y-%m-%d'))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "completed_lessons": json.loads(self.completed_lessons) if self.completed_lessons else [],
            "total_xp": self.total_xp,
            "current_streak": self.current_streak,
            "weak_topics": json.loads(self.weak_topics) if self.weak_topics else {},
            "last_activity_date": self.last_activity_date
        }
