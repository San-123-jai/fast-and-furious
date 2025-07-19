#!/usr/bin/env python3
"""
Script to reset user password in the database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from werkzeug.security import generate_password_hash

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def reset_user_password():
    """Reset password for existing user"""
    with app.app_context():
        # Find the user
        user = User.query.filter_by(email='sanjaithala0077@gmail.com').first()
        if not user:
            print("User not found!")
            return
        
        # Set a new password
        new_password = "Test123!"  # This meets the complexity requirements
        user.password_hash = generate_password_hash(new_password)
        
        # Save to database
        db.session.commit()
        
        print(f"Password reset successfully!")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"New Password: {new_password}")
        print("\nYou can now log in with these credentials.")

if __name__ == '__main__':
    reset_user_password() 