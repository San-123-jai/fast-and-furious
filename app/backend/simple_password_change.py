#!/usr/bin/env python3
"""
Simple script to change user password
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

def simple_password_change():
    """Simple password change utility"""
    with app.app_context():
        print("🔐 Simple Password Change Utility")
        print("=" * 40)
        
        # Get the user
        user = User.query.filter_by(email='boss@example.com').first()
        if not user:
            print("❌ User not found")
            return
        
        print(f"👤 User: {user.first_name} {user.last_name} ({user.email})")
        print(f"📧 Email: {user.email}")
        print(f"🔑 Current password: Boss123!")
        print()
        
        # Get new password
        print("Enter your new password (must be at least 8 characters with uppercase, lowercase, digit, and special character):")
        new_password = input("New password: ")
        
        # Validate password complexity
        if not User.is_password_complex(new_password):
            print("❌ Password must be at least 8 characters long and contain:")
            print("   - At least one uppercase letter")
            print("   - At least one lowercase letter")
            print("   - At least one digit")
            print("   - At least one special character")
            print()
            print("💡 Example of a strong password: MyNewPass123!")
            return
        
        # Confirm password
        confirm_password = input("Confirm new password: ")
        
        # Check if passwords match
        if new_password != confirm_password:
            print("❌ Passwords don't match!")
            return
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        print("✅ Password changed successfully!")
        print(f"🎉 You can now login with:")
        print(f"   Email: {user.email}")
        print(f"   Password: {new_password}")
        print()
        print("💡 Remember to keep your password secure!")

if __name__ == '__main__':
    simple_password_change() 