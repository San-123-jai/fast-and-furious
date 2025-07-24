
import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# --- Force project root on sys.path for Render ---
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    # Absolute imports for deployment (Render, project root)
    from app.backend.config import Config
    from app.backend.models.user import User, db
    from app.backend.models.profile import Profile, Skill, Experience, Education
    from app.backend.models.post import Post
    from app.backend.api import auth_bp, profile_bp, posts_bp, feed_bp, jobs_bp, messaging_bp
except ImportError:
    # Relative imports for local dev (from app/backend)
    from .config import Config
    from .models.user import User, db
    from .models.profile import Profile, Skill, Experience, Education
    from .models.post import Post
    from .api import auth_bp, profile_bp, posts_bp, feed_bp, jobs_bp, messaging_bp
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import sqlalchemy

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize app configuration
Config.init_app(app)

jwt = JWTManager(app)

# Initialize extensions
CORS(app, supports_credentials=True)

# Initialize database
db.init_app(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(posts_bp, url_prefix='/api/posts')
app.register_blueprint(feed_bp, url_prefix='/api/feed')
app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
app.register_blueprint(messaging_bp, url_prefix='/api/messages')

# Add route to serve uploaded images at root level
from flask import send_from_directory

@app.route('/uploads/<path:filename>')
def serve_uploaded_image(filename):
    """Serve uploaded images from the root level"""
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Always create tables on startup (temporary for deployment)
setup_database()

# TEMPORARY: Run migrations on every startup (for Render)
from flask_migrate import upgrade as migrate_upgrade
try:
    with app.app_context():
        migrate_upgrade()
    print("✅ Database migrations applied successfully!")
except Exception as e:
    print(f"⚠️  Database migration failed: {e}")

# TEMPORARY: Create a dummy user for login if not exists (after migration)
from app.backend.models.user import User, db
from werkzeug.security import generate_password_hash

def create_dummy_user():
    email = 'demo@example.com'
    password = 'Demo@1234'
    username = 'demo'
    # Check if is_deleted column exists
    inspector = sqlalchemy.inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('users')]
    if 'is_deleted' not in columns:
        print("⚠️  Skipping dummy user creation: 'is_deleted' column does not exist yet.")
        return
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(username=username, email=email, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        print(f"✅ Dummy user created: {email} / {password}")
    else:
        print(f"ℹ️  Dummy user already exists: {email}")

with app.app_context():
    create_dummy_user()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 
