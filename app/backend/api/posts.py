from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, db
from models.post import Post
from utils.media_processor import MediaProcessor
import json
import os
from config import Config

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_posts():
    """Get all posts with pagination and filtering"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)  # Max 50 per page
        user_id = request.args.get('user_id', type=int)
        
        # Build query
        query = Post.query.filter_by(is_published=True)
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        # Order by creation date (newest first)
        query = query.order_by(Post.created_at.desc())
        
        # Paginate results
        posts = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Format response
        posts_data = [post.to_dict() for post in posts.items]
        
        return jsonify({
            'posts': posts_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': posts.total,
                'pages': posts.pages,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch posts: {str(e)}'}), 500

@posts_bp.route('/', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_post():
    """Create a new post with optional media upload"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get form data
        content = request.form.get('content', '').strip()
        title = request.form.get('title', '').strip()
        tags = request.form.get('tags', '[]')
        
        # Validate content
        is_valid, message = Post.validate_content(content)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Parse tags
        try:
            tags_list = json.loads(tags) if tags else []
            if not isinstance(tags_list, list):
                tags_list = []
        except json.JSONDecodeError:
            tags_list = []
        
        # Handle media upload
        media_url = None
        media_type = None
        media_metadata = None
        
        if 'media' in request.files:
            media_file = request.files['media']
            media_type_param = request.form.get('media_type', 'image')
            
            # Validate media file
            is_valid, message = MediaProcessor.validate_file(media_file, media_type_param)
            if not is_valid:
                return jsonify({'error': message}), 400
            
            # Save media file
            media_info = MediaProcessor.save_media_file(media_file, media_type_param)
            media_url = media_info['url']
            media_type = media_info['media_type']
            media_metadata = media_info['metadata']
        
        # Create post
        post = Post(
            user_id=user_id,
            content=content,
            title=title if title else None,
            tags=tags_list,
            media_url=media_url,
            media_type=media_type,
            media_metadata=media_metadata
        )
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({
            'message': 'Post created successfully',
            'post': post.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create post: {str(e)}'}), 500

@posts_bp.route('/<int:post_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_post(post_id):
    """Get a specific post by ID"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        post = Post.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        if not post.is_published:
            return jsonify({'error': 'Post not available'}), 404
        
        # Increment view count
        post.views_count += 1
        db.session.commit()
        
        return jsonify({'post': post.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch post: {str(e)}'}), 500

@posts_bp.route('/<int:post_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_post(post_id):
    """Update a post"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = get_jwt_identity()
        post = Post.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        if post.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get form data
        data = request.get_json() or {}
        
        # Update allowed fields
        if 'content' in data:
            is_valid, message = Post.validate_content(data['content'])
            if not is_valid:
                return jsonify({'error': message}), 400
            post.content = data['content'].strip()
        
        if 'title' in data:
            post.title = data['title'].strip() if data['title'] else None
        
        if 'tags' in data:
            post.tags = data['tags'] if isinstance(data['tags'], list) else []
        
        if 'is_published' in data:
            post.is_published = bool(data['is_published'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Post updated successfully',
            'post': post.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update post: {str(e)}'}), 500

@posts_bp.route('/<int:post_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_post(post_id):
    """Delete a post"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = get_jwt_identity()
        post = Post.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        if post.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete associated media files
        if post.media_url:
            # Extract filepath from URL
            media_path = post.media_url.replace('/uploads/', '')
            full_path = os.path.join(Config.UPLOAD_FOLDER, media_path)
            MediaProcessor.delete_media_file(full_path)
        
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({'message': 'Post deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete post: {str(e)}'}), 500

@posts_bp.route('/<int:post_id>/like', methods=['POST', 'OPTIONS'])
@jwt_required()
def like_post(post_id):
    """Like/unlike a post"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        post = Post.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Toggle like (simple implementation)
        post.likes_count += 1
        db.session.commit()
        
        return jsonify({
            'message': 'Post liked successfully',
            'likes_count': post.likes_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to like post: {str(e)}'}), 500 