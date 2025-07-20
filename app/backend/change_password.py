#!/usr/bin/env python3
"""
Script to change user password securely
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from models.post import Post
from werkzeug.security import generate_password_hash
import getpass

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def change_password():
    """Change user password securely"""
    with app.app_context():
        print("🔐 Password Change Utility")
        print("=" * 40)
        
        # Get the user
        user = User.query.filter_by(email='boss@example.com').first()
        if not user:
            print("❌ User not found")
            return
        
        print(f"👤 User: {user.first_name} {user.last_name} ({user.email})")
        print()
        
        # Get current password for verification
        current_password = getpass.getpass("Enter current password: ")
        
        # Verify current password
        if not user.check_password(current_password):
            print("❌ Current password is incorrect!")
            return
        
        print("✅ Current password verified!")
        print()
        
        # Get new password
        new_password = getpass.getpass("Enter new password: ")
        confirm_password = getpass.getpass("Confirm new password: ")
        
        # Check if passwords match
        if new_password != confirm_password:
            print("❌ Passwords don't match!")
            return
        
        # Validate password complexity
        if not User.is_password_complex(new_password):
            print("❌ Password must be at least 8 characters long and contain:")
            print("   - At least one uppercase letter")
            print("   - At least one lowercase letter")
            print("   - At least one digit")
            print("   - At least one special character")
            return
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        print("✅ Password changed successfully!")
        print(f"🎉 You can now login with:")
        print(f"   Email: {user.email}")
        print(f"   Password: [Your new password]")
        print()
        print("💡 Remember to keep your password secure!")

if __name__ == '__main__':
    change_password() 