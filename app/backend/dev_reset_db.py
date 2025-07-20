#!/usr/bin/env python3
"""
Database Reset Script
This script drops all existing tables and recreates them from scratch.
Use this for development when you need a clean database.
"""

import os
import sys
from sqlalchemy import text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app, db
from models.user import User
from models.profile import Profile, Skill, Experience, Education

def reset_database():
    """Reset the database by dropping all tables and recreating them"""
    with app.app_context():
        print("🔄 Resetting database...")
        
        # Drop all tables
        print("📥 Dropping all existing tables...")
        db.drop_all()
        
        # Create all tables
        print("📤 Creating all tables...")
        db.create_all()
        
        print("✅ Database reset completed successfully!")
        print("📋 All tables have been dropped and recreated.")
        print("🔐 You'll need to create a new user account.")

if __name__ == "__main__":
    try:
        reset_database()
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        sys.exit(1) 