from flask import Blueprint, request, jsonify

feed_bp = Blueprint('feed', __name__)
 
@feed_bp.route('/', methods=['GET', 'OPTIONS'])
def get_feed():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'message': 'Feed endpoint - to be implemented'}), 200 