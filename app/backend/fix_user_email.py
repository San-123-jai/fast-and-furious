#!/usr/bin/env python3
"""
Script to fix the user email back to boss@example.com
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from models.post import Post

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def fix_user_email():
    """Fix the user email back to boss@example.com"""
    with app.app_context():
        print("🔧 Fixing user email...")
        
        # Get the user by current email
        user = User.query.filter_by(email='sanjaithala0077@gmail.com').first()
        if not user:
            print("❌ User not found")
            return
        
        print(f"👤 Found user: {user.username}")
        print(f"   Current email: {user.email}")
        
        # Update email
        user.email = 'boss@example.com'
        db.session.commit()
        
        print(f"✅ Email updated to: {user.email}")
        print("🎉 User can now login with boss@example.com and Boss123!")

if __name__ == '__main__':
    fix_user_email() 