#!/usr/bin/env python3
"""
Script to change user email address
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from models.post import Post
import re

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def change_email():
    """Change user email address"""
    with app.app_context():
        print("📧 Email Change Utility")
        print("=" * 40)
        
        # Get the user
        user = User.query.filter_by(email='boss@example.com').first()
        if not user:
            print("❌ User not found")
            return
        
        print(f"👤 User: {user.first_name} {user.last_name}")
        print(f"📧 Current email: {user.email}")
        print()
        
        # Get new email
        new_email = input("Enter new email address: ").strip()
        
        # Validate email format
        if not validate_email(new_email):
            print("❌ Invalid email format!")
            print("💡 Please enter a valid email address (e.g., user@example.com)")
            return
        
        # Check if email is already taken
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user and existing_user.id != user.id:
            print("❌ Email address is already in use by another account!")
            return
        
        # Confirm email change
        print(f"\n📧 You want to change your email from:")
        print(f"   {user.email}")
        print(f"   to:")
        print(f"   {new_email}")
        print()
        
        confirm = input("Are you sure? (yes/no): ").strip().lower()
        if confirm not in ['yes', 'y']:
            print("❌ Email change cancelled.")
            return
        
        # Update email
        old_email = user.email
        user.email = new_email
        db.session.commit()
        
        print("✅ Email changed successfully!")
        print(f"🎉 Your new login credentials:")
        print(f"   Email: {new_email}")
        print(f"   Password: San@1234")
        print()
        print("💡 You can now login with your new email address!")

if __name__ == '__main__':
    change_email() 