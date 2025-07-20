from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from models.user import db

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    media_url = Column(String(500), nullable=True)
    media_type = Column(String(50), nullable=True)  # 'image', 'video', 'gif'
    media_metadata = Column(JSON, nullable=True)  # Store additional media info like dimensions, duration, etc.
    
    # Post metadata
    title = Column(String(200), nullable=True)
    tags = Column(JSON, nullable=True)  # Array of tags
    is_published = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Engagement tracking
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', back_populates='posts')
    
    def __repr__(self):
        return f'<Post {self.id} by {self.user_id}>'
    
    def to_dict(self):
        """Convert post to dictionary for API responses"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'media_url': self.media_url,
            'media_type': self.media_type,
            'media_metadata': self.media_metadata,
            'title': self.title,
            'tags': self.tags or [],
            'is_published': self.is_published,
            'is_featured': self.is_featured,
            'likes_count': self.likes_count,
            'comments_count': self.comments_count,
            'shares_count': self.shares_count,
            'views_count': self.views_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'profile_image': self.user.profile_image
            } if self.user else None
        }
    
    @staticmethod
    def validate_content(content):
        """Validate post content"""
        if not content or not content.strip():
            return False, "Post content cannot be empty"
        
        if len(content.strip()) > 10000:  # 10KB limit
            return False, "Post content is too long (max 10,000 characters)"
        
        return True, "Content is valid"
    
    @staticmethod
    def validate_media_type(media_type):
        """Validate media type"""
        allowed_types = ['image', 'video', 'gif']
        if media_type and media_type not in allowed_types:
            return False, f"Invalid media type. Allowed: {', '.join(allowed_types)}"
        return True, "Media type is valid"
