#!/usr/bin/env python3
"""
Script to check user existence and verify credentials
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from models.post import Post
from werkzeug.security import check_password_hash

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def check_user():
    """Check if user exists and verify credentials"""
    with app.app_context():
        print("🔍 Checking database for users...")
        
        # Check all users
        users = User.query.all()
        print(f"📊 Total users in database: {len(users)}")
        
        for user in users:
            print(f"\n👤 User Details:")
            print(f"   ID: {user.id}")
            print(f"   Username: {user.username}")
            print(f"   Email: {user.email}")
            print(f"   First Name: {user.first_name}")
            print(f"   Last Name: {user.last_name}")
            print(f"   Created: {user.created_at}")
            
            # Test password
            test_password = "Boss123!"
            is_valid = check_password_hash(user.password_hash, test_password)
            print(f"   Password 'Boss123!' valid: {is_valid}")
            
            # Test with different password
            test_password2 = "wrongpassword"
            is_valid2 = check_password_hash(user.password_hash, test_password2)
            print(f"   Password 'wrongpassword' valid: {is_valid2}")
        
        # Check specific user
        specific_user = User.query.filter_by(email='boss@example.com').first()
        if specific_user:
            print(f"\n✅ Found user with email 'boss@example.com'")
            print(f"   Username: {specific_user.username}")
            
            # Test login
            test_password = "Boss123!"
            if check_password_hash(specific_user.password_hash, test_password):
                print(f"   ✅ Password '{test_password}' is correct!")
            else:
                print(f"   ❌ Password '{test_password}' is incorrect!")
        else:
            print(f"\n❌ No user found with email 'boss@example.com'")

if __name__ == '__main__':
    check_user() 