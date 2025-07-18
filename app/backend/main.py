
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

jwt = JWTManager(app)

# Initialize extensions
CORS(app, 
     origins=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 
              'http://localhost:5175', 'http://127.0.0.1:5175', 'http://localhost:5176', 'http://127.0.0.1:5176',
              'http://localhost:3000', 'http://127.0.0.1:3000'],
     supports_credentials=False, 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'])

# Import models
from models.user import User, db as user_db
from models.profile import Profile, Skill, Experience, Education, db as profile_db

# Initialize database - use the same instance from user model
db = user_db
db.init_app(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Import API blueprints
from api import auth_bp, profile_bp, posts_bp, feed_bp, jobs_bp, messaging_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(profile_bp, url_prefix='/profile')
app.register_blueprint(posts_bp, url_prefix='/posts')
app.register_blueprint(feed_bp, url_prefix='/feed')
app.register_blueprint(jobs_bp, url_prefix='/jobs')
app.register_blueprint(messaging_bp, url_prefix='/messages')

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
