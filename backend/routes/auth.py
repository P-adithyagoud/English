import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from functools import wraps
from backend.models import db, User, StudentProgress

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = "fluentflow-ai-super-secret-key-2026"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({"message": "Token is missing!"}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({"message": "User not found!"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('password') or not data.get('role'):
        return jsonify({"message": "Missing required fields"}), 400
        
    email = data.get('email').strip().lower()
    role = data.get('role')
    
    if role not in ['student', 'faculty']:
        return jsonify({"message": "Invalid role specified"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User with this email already exists"}), 409
        
    user = User(
        name=data.get('name'),
        email=email,
        role=role,
        streak=0,
        xp=0
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    # Initialize progress row if student
    if role == 'student':
        progress = StudentProgress(user_id=user.id)
        db.session.add(progress)
        db.session.commit()
        
    # Generate JWT
    token = jwt.encode({
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")
    
    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Missing email or password"}), 400
        
    email = data.get('email').strip().lower()
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({"message": "Invalid email or password"}), 401
        
    token = jwt.encode({
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify(current_user.to_dict()), 200
