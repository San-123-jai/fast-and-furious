from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.post import Post
from ..utils.media_processor import MediaProcessor
from sqlalchemy import or_, and_, desc, asc, func, String
from sqlalchemy.orm import joinedload
import json
import os
from datetime import datetime, timedelta
from ..config import Config
import redis
import pickle

posts_bp = Blueprint('posts', __name__)
 
# Initialize Redis for caching (optional - will work without Redis)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=False)
    REDIS_AVAILABLE = True
except:
    REDIS_AVAILABLE = False
    redis_client = None

def get_cache_key(prefix, **kwargs):
    """Generate cache key for Redis"""
    key_parts = [prefix]
    for k, v in sorted(kwargs.items()):
        key_parts.append(f"{k}:{v}")
    return ":".join(key_parts)

def get_cached_data(key, expire_time=300):
    """Get data from cache"""
    if not REDIS_AVAILABLE:
        return None
    
    try:
        data = redis_client.get(key)
        if data:
            return pickle.loads(data)
    except:
        pass
    return None

def set_cached_data(key, data, expire_time=300):
    """Set data in cache"""
    if not REDIS_AVAILABLE:
        return
    
    try:
        redis_client.setex(key, expire_time, pickle.dumps(data))
    except:
        pass

def invalidate_cache_pattern(pattern):
    """Invalidate cache by pattern"""
    if not REDIS_AVAILABLE:
        return
    
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
    except:
        pass

@posts_bp.route('/', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_posts():
    """Get all posts with advanced filtering, sorting, and pagination"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)  # Max 50 per page
        user_id = request.args.get('user_id', type=int)
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        tags = request.args.get('tags', '').strip()
        visibility = request.args.get('visibility', '').strip()
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Validate sort parameters
        allowed_sort_fields = ['created_at', 'updated_at', 'likes_count', 'views_count', 'comments_count', 'shares_count']
        if sort_by not in allowed_sort_fields:
            sort_by = 'created_at'
        
        if sort_order not in ['asc', 'desc']:
            sort_order = 'desc'
        
        # Build cache key
        cache_key = get_cache_key(
            'posts:list',
            page=page,
            per_page=per_page,
            user_id=user_id or 'all',
            search=search or 'none',
            category=category or 'none',
            tags=tags or 'none',
            visibility=visibility or 'all',
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # Try to get from cache
        cached_result = get_cached_data(cache_key, 60)  # 1 minute cache
        if cached_result:
            return jsonify(cached_result), 200
        
        # Build query with eager loading
        query = Post.query.options(joinedload(Post.user)).filter_by(is_published=True)
        
        # Apply filters
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Post.content.ilike(search_term),
                    Post.title.ilike(search_term),
                    Post.tags.cast(String).ilike(search_term)
                )
            )
        
        if category:
            # For now, we'll use tags as categories
            query = query.filter(Post.tags.cast(String).ilike(f"%{category}%"))
        
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            for tag in tag_list:
                query = query.filter(Post.tags.cast(String).ilike(f"%{tag}%"))
        
        if visibility == 'featured':
            query = query.filter_by(is_featured=True)
        elif visibility == 'recent':
            # Posts from last 7 days
            week_ago = datetime.utcnow() - timedelta(days=7)
            query = query.filter(Post.created_at >= week_ago)
        
        # Apply sorting
        sort_column = getattr(Post, sort_by)
        if sort_order == 'desc':
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Paginate results
        posts = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Format response
        posts_data = [post.to_dict() for post in posts.items]
        
        result = {
            'posts': posts_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': posts.total,
                'pages': posts.pages,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            },
            'filters': {
                'search': search,
                'category': category,
                'tags': tags,
                'visibility': visibility,
                'sort_by': sort_by,
                'sort_order': sort_order
            }
        }
        
        # Cache the result
        set_cached_data(cache_key, result, 60)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch posts: {str(e)}'}), 500

@posts_bp.route('/categories', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_categories():
    """Get all available categories (tags)"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Try to get from cache
        cache_key = 'posts:categories'
        cached_result = get_cached_data(cache_key, 300)  # 5 minutes cache
        if cached_result:
            return jsonify(cached_result), 200
        
        # Get all unique tags from posts
        posts = Post.query.filter_by(is_published=True).all()
        all_tags = []
        for post in posts:
            if post.tags:
                all_tags.extend(post.tags)
        
        # Count tag frequency
        tag_counts = {}
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort by frequency and get top 20
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:20]
        
        categories = [
            {
                'name': tag,
                'count': count,
                'slug': tag.lower().replace(' ', '-')
            }
            for tag, count in sorted_tags
        ]
        
        result = {'categories': categories}
        
        # Cache the result
        set_cached_data(cache_key, result, 300)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch categories: {str(e)}'}), 500

@posts_bp.route('/popular-tags', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_popular_tags():
    """Get most popular tags"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Try to get from cache
        cache_key = 'posts:popular_tags'
        cached_result = get_cached_data(cache_key, 600)  # 10 minutes cache
        if cached_result:
            return jsonify(cached_result), 200
        
        # Get all unique tags from posts
        posts = Post.query.filter_by(is_published=True).all()
        all_tags = []
        for post in posts:
            if post.tags:
                all_tags.extend(post.tags)
        
        # Count tag frequency
        tag_counts = {}
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort by frequency and get top 15
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:15]
        
        popular_tags = [
            {
                'tag': tag,
                'count': count,
                'slug': tag.lower().replace(' ', '-')
            }
            for tag, count in sorted_tags
        ]
        
        result = {'popular_tags': popular_tags}
        
        # Cache the result
        set_cached_data(cache_key, result, 600)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch popular tags: {str(e)}'}), 500

@posts_bp.route('/stats', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_posts_stats():
    """Get posts statistics"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Try to get from cache
        cache_key = 'posts:stats'
        cached_result = get_cached_data(cache_key, 300)  # 5 minutes cache
        if cached_result:
            return jsonify(cached_result), 200
        
        # Calculate statistics
        total_posts = Post.query.filter_by(is_published=True).count()
        featured_posts = Post.query.filter_by(is_published=True, is_featured=True).count()
        
        # Posts from last 7 days
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_posts = Post.query.filter(
            Post.is_published == True,
            Post.created_at >= week_ago
        ).count()
        
        # Total engagement
        total_likes = db.session.query(func.sum(Post.likes_count)).filter_by(is_published=True).scalar() or 0
        total_views = db.session.query(func.sum(Post.views_count)).filter_by(is_published=True).scalar() or 0
        
        stats = {
            'total_posts': total_posts,
            'featured_posts': featured_posts,
            'recent_posts': recent_posts,
            'total_likes': total_likes,
            'total_views': total_views
        }
        
        result = {'stats': stats}
        
        # Cache the result
        set_cached_data(cache_key, result, 300)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}'}), 500

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
        
        # Invalidate cache
        invalidate_cache_pattern('posts:*')
        
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
        
        # Invalidate cache
        invalidate_cache_pattern('posts:*')
        
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
        
        # Invalidate cache
        invalidate_cache_pattern('posts:*')
        
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
        
        # Invalidate cache
        invalidate_cache_pattern('posts:*')
        
        return jsonify({
            'message': 'Post liked successfully',
            'likes_count': post.likes_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to like post: {str(e)}'}), 500 