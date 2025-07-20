#!/usr/bin/env python3
"""
Script to create a new user account in the database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from models.post import Post
from werkzeug.security import generate_password_hash
from datetime import datetime

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def create_user():
    """Create a new user account"""
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter_by(email='sanjaithala0077.com').first()
        if existing_user:
            print("User already exists!")
            print(f"Username: {existing_user.username}")
            print(f"Email: {existing_user.email}")
            return
        
        # Create new user
        new_user = User(
            username='boss',
            email='boss@example.com',
            first_name='Boss',
            last_name='User',
            password_hash=generate_password_hash('Boss123!'),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        print("✅ User created successfully!")
        print(f"Username: {new_user.username}")
        print(f"Email: {new_user.email}")
        print(f"Password: Sanjai@1432")
        print("\nYou can now log in with these credentials.")

if __name__ == '__main__':
    create_user() 