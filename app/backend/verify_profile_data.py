#!/usr/bin/env python3
"""
Script to verify the restored profile data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from models.profile import Profile, Skill, Experience, Education
from models.post import Post

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def verify_profile_data():
    """Verify the restored profile data"""
    with app.app_context():
        print("🔍 Verifying profile data...")
        
        # Get the user
        user = User.query.filter_by(email='boss@example.com').first()
        if not user:
            print("❌ User not found")
            return
        
        print(f"👤 User: {user.first_name} {user.last_name} ({user.email})")
        print(f"   Headline: {user.headline}")
        print(f"   Company: {user.company}")
        print(f"   Job Title: {user.job_title}")
        print(f"   Industry: {user.industry}")
        print(f"   Phone: {user.phone}")
        print(f"   Website: {user.website}")
        
        # Get profile
        profile = Profile.query.filter_by(user_id=user.id).first()
        if profile:
            print(f"\n📋 Profile:")
            print(f"   Bio: {profile.bio[:100]}...")
            print(f"   Location: {profile.location}")
        else:
            print("❌ Profile not found")
        
        # Get skills
        skills = Skill.query.filter_by(profile_id=profile.id).all() if profile else []
        print(f"\n📚 Skills ({len(skills)}):")
        for skill in skills:
            print(f"   • {skill.name}")
        
        # Get experience
        experiences = Experience.query.filter_by(profile_id=profile.id).all() if profile else []
        print(f"\n💼 Work Experience ({len(experiences)}):")
        for exp in experiences:
            print(f"   • {exp.title} at {exp.company}")
            print(f"     {exp.start_date} - {exp.end_date or 'Present'}")
        
        # Get education
        educations = Education.query.filter_by(profile_id=profile.id).all() if profile else []
        print(f"\n🎓 Education ({len(educations)}):")
        for edu in educations:
            print(f"   • {edu.degree} in {edu.field} from {edu.school}")
            print(f"     {edu.start_date} - {edu.end_date or 'Present'}")
        
        # Get posts
        posts = Post.query.filter_by(user_id=user.id).all()
        print(f"\n📝 Posts ({len(posts)}):")
        for post in posts:
            print(f"   • {post.title}")
            print(f"     Tags: {', '.join(post.tags)}")
            print(f"     Created: {post.created_at}")
        
        print(f"\n✅ Profile data verification complete!")

if __name__ == '__main__':
    verify_profile_data() 