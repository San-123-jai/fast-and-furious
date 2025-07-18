from flask import Blueprint, request, jsonify

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/', methods=['GET', 'OPTIONS'])
def get_posts():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'message': 'Posts endpoint - to be implemented'}), 200

@posts_bp.route('/', methods=['POST', 'OPTIONS'])
def create_post():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'message': 'Create post endpoint - to be implemented'}), 200 