import os
import sys
from dotenv import load_dotenv

# Explicitly load .env from the backend folder to avoid CWD mismatch on launch
backend_dir = os.path.dirname(os.path.abspath(__file__))

# Ensure parent directory is in sys.path so 'backend.xxx' imports work everywhere
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

env_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=env_path)

from flask import Flask, jsonify
from flask_cors import CORS
from backend.models import db
from backend.database import init_db
from backend.routes.auth import auth_bp
from backend.routes.student import student_bp
from backend.routes.learning import learning_bp
from backend.routes.faculty import faculty_bp

def create_app(test_config=None):
    app = Flask(__name__)
    
    # Configure CORS to allow our React frontend to talk to Flask
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Database Configuration
    # Fallback to local SQLite file for effortless zero-config execution
    if os.environ.get('VERCEL') == '1':
        sqlite_path = '/tmp/fluentflow.db'
    else:
        sqlite_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'fluentflow.db')
        
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # If postgres:// is passed (common in Heroku/Supabase), change it to postgresql:// for SQLAlchemy
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        # Test if the PostgreSQL connection is reachable
        try:
            import psycopg2
            print("Testing connection to configured PostgreSQL database...")
            # Use a short timeout of 3 seconds so we don't hang if offline
            conn = psycopg2.connect(database_url, connect_timeout=3)
            conn.close()
            print("Successfully verified PostgreSQL connection. Using PostgreSQL!")
            app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        except Exception as e:
            print(f"\n[DATABASE WARNING] PostgreSQL connection check failed: {e}")
            print(f">>> Falling back to SQLite database ({sqlite_path}) for offline mode...\n")
            app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{sqlite_path}'
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{sqlite_path}'
        
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fluentflow-super-secret-session-key')
    
    if test_config:
        app.config.update(test_config)
        
    # Initialize DB with App
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(learning_bp, url_prefix='/api/learning')
    app.register_blueprint(faculty_bp, url_prefix='/api/faculty')
    
    # Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"message": "Resource not found"}), 404
        
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"message": "An internal server error occurred"}), 500
        
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "FluentFlow AI API Backend",
            "timestamp": "2026-05-21T13:42:00"
        }), 200

    # Auto-initialize and seed tables
    init_db(app)
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
