from flask import Blueprint, request, jsonify

messaging_bp = Blueprint('messaging', __name__)

@messaging_bp.route('/', methods=['GET', 'OPTIONS'])
def get_messages():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'message': 'Messages endpoint - to be implemented'}), 200 