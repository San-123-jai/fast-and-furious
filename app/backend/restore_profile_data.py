#!/usr/bin/env python3
"""
Script to restore comprehensive profile data for the user
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from models.profile import Profile, Skill, Experience, Education
from models.post import Post
from datetime import datetime

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def restore_profile_data():
    """Restore comprehensive profile data"""
    with app.app_context():
        print("🔄 Restoring profile data...")
        
        # Get the user
        user = User.query.filter_by(email='boss@example.com').first()
        if not user:
            print("❌ User not found")
            return
        
        print(f"👤 Restoring data for: {user.username} ({user.email})")
        
        # Update user profile information
        user.first_name = "Sanjai"
        user.last_name = "Kumar"
        user.headline = "Full Stack Developer & Tech Enthusiast"
        user.industry = "Technology"
        user.company = "Fast & Furious Tech"
        user.job_title = "Senior Software Engineer"
        user.phone = "+91 98765 43210"
        user.website = "https://sanjai-kumar.dev"
        
        # Create or update profile
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
            db.session.flush()  # Get the profile ID
        
        profile.bio = """Passionate Full Stack Developer with expertise in modern web technologies. 
        I love building scalable applications and solving complex problems. 
        Currently working on exciting projects that push the boundaries of what's possible in web development."""
        
        profile.location = "Chennai, Tamil Nadu, India"
        
        # Add skills
        print("📚 Adding skills...")
        skills_data = [
            "JavaScript", "TypeScript", "React", "Node.js", "Python", 
            "Flask", "MySQL", "MongoDB", "Docker", "AWS", "Git", "Tailwind CSS"
        ]
        
        # Clear existing skills and add new ones
        Skill.query.filter_by(profile_id=profile.id).delete()
        for skill_name in skills_data:
            skill = Skill(
                profile_id=profile.id,
                name=skill_name
            )
            db.session.add(skill)
        
        # Add experience
        print("💼 Adding work experience...")
        experiences_data = [
            {
                "title": "Senior Software Engineer",
                "company": "Fast & Furious Tech",
                "start_date": "2023-01-01",
                "end_date": None,
                "description": "Leading development of modern web applications using React, Node.js, and Python. Mentoring junior developers and implementing best practices."
            },
            {
                "title": "Full Stack Developer",
                "company": "Tech Solutions Inc.",
                "start_date": "2021-03-01",
                "end_date": "2022-12-31",
                "description": "Developed and maintained multiple web applications. Worked with React, TypeScript, and Node.js. Collaborated with cross-functional teams."
            },
            {
                "title": "Frontend Developer",
                "company": "Digital Innovations",
                "start_date": "2019-06-01",
                "end_date": "2021-02-28",
                "description": "Built responsive user interfaces using React and modern CSS frameworks. Optimized application performance and user experience."
            }
        ]
        
        # Clear existing experience and add new ones
        Experience.query.filter_by(profile_id=profile.id).delete()
        for exp_data in experiences_data:
            experience = Experience(
                profile_id=profile.id,
                title=exp_data["title"],
                company=exp_data["company"],
                start_date=datetime.strptime(exp_data["start_date"], "%Y-%m-%d"),
                end_date=datetime.strptime(exp_data["end_date"], "%Y-%m-%d") if exp_data["end_date"] else None,
                description=exp_data["description"]
            )
            db.session.add(experience)
        
        # Add education
        print("🎓 Adding education...")
        education_data = [
            {
                "school": "Anna University",
                "degree": "Bachelor of Technology",
                "field": "Computer Science",
                "start_date": "2015-08-01",
                "end_date": "2019-05-31"
            },
            {
                "school": "Udemy",
                "degree": "Full Stack Web Development Certification",
                "field": "Web Development",
                "start_date": "2020-01-01",
                "end_date": "2020-06-30"
            }
        ]
        
        # Clear existing education and add new ones
        Education.query.filter_by(profile_id=profile.id).delete()
        for edu_data in education_data:
            education = Education(
                profile_id=profile.id,
                school=edu_data["school"],
                degree=edu_data["degree"],
                field=edu_data["field"],
                start_date=datetime.strptime(edu_data["start_date"], "%Y-%m-%d"),
                end_date=datetime.strptime(edu_data["end_date"], "%Y-%m-%d") if edu_data["end_date"] else None
            )
            db.session.add(education)
        
        # Add some sample posts
        print("📝 Adding sample posts...")
        posts_data = [
            {
                "title": "Building Modern Web Applications",
                "content": "Just finished working on an exciting project using **React** and **Node.js**. The combination of modern frontend frameworks with robust backend APIs is truly powerful for creating scalable applications. *What's your favorite tech stack for web development?*",
                "tags": ["web-development", "react", "nodejs", "programming"]
            },
            {
                "title": "The Future of Full Stack Development",
                "content": "Exploring the latest trends in full stack development. **TypeScript** has become essential for building maintainable codebases, and **Docker** is revolutionizing how we deploy applications. The integration of AI tools is also changing how we approach development. *What technologies are you most excited about?*",
                "tags": ["typescript", "docker", "ai", "development"]
            },
            {
                "title": "Learning Python for Backend Development",
                "content": "Started diving deeper into **Python** for backend development. Flask and FastAPI are excellent frameworks for building APIs. The simplicity and readability of Python make it perfect for rapid prototyping. *Share your Python development tips!*",
                "tags": ["python", "flask", "api", "backend"]
            }
        ]
        
        # Clear existing posts and add new ones
        Post.query.filter_by(user_id=user.id).delete()
        for post_data in posts_data:
            post = Post(
                user_id=user.id,
                title=post_data["title"],
                content=post_data["content"],
                tags=post_data["tags"],
                is_published=True
            )
            db.session.add(post)
        
        # Commit all changes
        db.session.commit()
        
        print("✅ Profile data restored successfully!")
        print(f"   📚 Added {len(skills_data)} skills")
        print(f"   💼 Added {len(experiences_data)} work experiences")
        print(f"   🎓 Added {len(education_data)} education entries")
        print(f"   📝 Added {len(posts_data)} sample posts")
        print(f"   👤 Updated user profile information")
        
        print("\n🎉 Your profile is now fully restored with comprehensive data!")

if __name__ == '__main__':
    restore_profile_data() 