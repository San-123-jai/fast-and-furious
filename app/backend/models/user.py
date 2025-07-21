from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import re
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Extended profile fields
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    profile_image = db.Column(db.String(255))  # URL to profile image
    phone = db.Column(db.String(20))
    website = db.Column(db.String(255))
    headline = db.Column(db.String(200))  # Professional headline
    industry = db.Column(db.String(100))
    company = db.Column(db.String(100))
    job_title = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('Post', back_populates='user', cascade='all, delete-orphan')
    
    def set_password(self, password):
        if not self.is_password_complex(password):
            raise ValueError(
                "Password must be at least 8 characters long, "
                "contain an uppercase letter, a lowercase letter, "
                "a digit, and a special character."
            )
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def is_password_complex(password):
        # At least 8 chars, one uppercase, one lowercase, one digit, one special char
        if (len(password) < 8 or
            not re.search(r"[A-Z]", password) or
            not re.search(r"[a-z]", password) or
            not re.search(r"\d", password) or
            not re.search(r"[^\w\s]", password)):
            return False
        return True

    @staticmethod
    def is_unique_username(username):
        return User.query.filter_by(username=username).first() is None

    @staticmethod
    def is_unique_email(email):
        return User.query.filter_by(email=email).first() is None
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'profile_image': self.profile_image,
            'phone': self.phone,
            'website': self.website,
            'headline': self.headline,
            'industry': self.industry,
            'company': self.company,
            'job_title': self.job_title,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def update_profile(self, data):
        """Update profile fields with validation"""
        allowed_fields = [
            'first_name', 'last_name', 'phone', 'website', 
            'headline', 'industry', 'company', 'job_title'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(self, field, data[field])
        
        # Update timestamp
        self.updated_at = datetime.utcnow()
