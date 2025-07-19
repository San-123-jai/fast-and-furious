from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User, db
from flask_jwt_extended import create_access_token
import jwt
from datetime import datetime, timedelta
import os

auth_bp = Blueprint('auth', __name__)
 
# Remove custom generate_token function

@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    print(f"DEBUG: Received {request.method} request to /auth/signup")
    print(f"DEBUG: Origin: {request.headers.get('Origin')}")
    print(f"DEBUG: Headers: {dict(request.headers)}")
    
    if request.method == 'OPTIONS':
        print("DEBUG: Handling OPTIONS request")
        return '', 200
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user = User(username=name, email=email, password_hash='')
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token using Flask-JWT-Extended (identity must be str)
        token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token using Flask-JWT-Extended (identity must be str)
        token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 