
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize app configuration
Config.init_app(app)

jwt = JWTManager(app)

# Initialize extensions
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"], 
     supports_credentials=True, 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

# Import models - User first, then Profile models
from models.user import User, db
from models.profile import Profile, Skill, Experience, Education
from models.post import Post

# Initialize database
db.init_app(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Import API blueprints
from api import auth_bp, profile_bp, posts_bp, feed_bp, jobs_bp, messaging_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(posts_bp, url_prefix='/api/posts')
app.register_blueprint(feed_bp, url_prefix='/api/feed')
app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
app.register_blueprint(messaging_bp, url_prefix='/api/messages')

# Add route to serve uploaded images at root level
from flask import send_from_directory
import os

@app.route('/uploads/<path:filename>')
def serve_uploaded_image(filename):
    """Serve uploaded images from the root level"""
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000) 
