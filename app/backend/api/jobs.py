from flask import Blueprint, request, jsonify

jobs_bp = Blueprint('jobs', __name__)
 
@jobs_bp.route('/', methods=['GET', 'OPTIONS'])
def get_jobs():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'message': 'Jobs endpoint - to be implemented'}), 200 