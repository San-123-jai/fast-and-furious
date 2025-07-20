#!/usr/bin/env python3
"""
Test script to verify post creation functionality
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import Config
from models.user import User, db
from models.post import Post
from datetime import datetime

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def test_post_creation():
    """Test post creation functionality"""
    with app.app_context():
        print("🧪 Testing post creation functionality...")
        
        # Get the first user
        user = User.query.first()
        if not user:
            print("❌ No users found in database")
            return
        
        print(f"👤 Using user: {user.username} ({user.email})")
        
        # Create a test post
        test_post = Post(
            user_id=user.id,
            content="This is a **test post** with *formatting* and some content to verify the post creation functionality is working properly.",
            title="Test Post - Post Creation System",
            tags=["test", "post", "creation"],
            is_published=True
        )
        
        db.session.add(test_post)
        db.session.commit()
        
        print(f"✅ Test post created successfully!")
        print(f"   Post ID: {test_post.id}")
        print(f"   Content: {test_post.content[:50]}...")
        print(f"   Title: {test_post.title}")
        print(f"   Tags: {test_post.tags}")
        print(f"   Created: {test_post.created_at}")
        
        # Test post retrieval
        retrieved_post = Post.query.get(test_post.id)
        if retrieved_post:
            print(f"✅ Post retrieval test passed!")
            print(f"   Retrieved content: {retrieved_post.content[:50]}...")
        else:
            print("❌ Post retrieval test failed!")
        
        # Test post to_dict method
        post_dict = test_post.to_dict()
        print(f"✅ Post to_dict test passed!")
        print(f"   Dict keys: {list(post_dict.keys())}")
        
        # Clean up test post
        db.session.delete(test_post)
        db.session.commit()
        print("🧹 Test post cleaned up")

if __name__ == '__main__':
    test_post_creation() 