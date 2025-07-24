from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.profile import Profile, Skill, Experience, Education
from ..utils.image_processor import save_uploaded_file, delete_profile_image
import os
from ..config import Config

profile_bp = Blueprint('profile', __name__)
 
def get_or_create_profile(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.session.add(profile)
        db.session.commit()
    return profile

@profile_bp.route('', methods=['GET', 'OPTIONS'])
@profile_bp.route('/', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_profile():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    profile = get_or_create_profile(user_id)
    skills = [s.name for s in Skill.query.filter_by(profile_id=profile.id).all()]
    experiences = [
        {
            'id': e.id,
            'title': e.title,
            'company': e.company,
            'start_date': e.start_date.isoformat() if e.start_date else None,
            'end_date': e.end_date.isoformat() if e.end_date else None,
            'description': e.description
        } for e in Experience.query.filter_by(profile_id=profile.id).all()
    ]
    educations = [
        {
            'id': ed.id,
            'school': ed.school,
            'degree': ed.degree,
            'field': ed.field,
            'start_date': ed.start_date.isoformat() if ed.start_date else None,
            'end_date': ed.end_date.isoformat() if ed.end_date else None
        } for ed in Education.query.filter_by(profile_id=profile.id).all()
    ]
    profile_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'profile_image': user.profile_image,
        'phone': user.phone,
        'website': user.website,
        'headline': user.headline,
        'industry': user.industry,
        'company': user.company,
        'job_title': user.job_title,
        'bio': profile.bio,
        'location': profile.location,
        'skills': skills,
        'experiences': experiences,
        'educations': educations,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'updated_at': user.updated_at.isoformat() if user.updated_at else None
    }
    return jsonify(profile_data), 200

@profile_bp.route('', methods=['PUT', 'OPTIONS'])
@profile_bp.route('/', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_profile():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    profile = get_or_create_profile(user_id)
    data = request.get_json()
    
    # Update user profile fields
    user.update_profile(data)
    
    # Update basic user fields
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    
    # Update profile fields
    if 'bio' in data:
        profile.bio = data['bio']
    if 'location' in data:
        profile.location = data['location']
    
    # Skills
    if 'skills' in data:
        Skill.query.filter_by(profile_id=profile.id).delete()
        for skill in data['skills']:
            if skill.strip():  # Only add non-empty skills
                db.session.add(Skill(profile_id=profile.id, name=skill.strip()))
    
    # Experience
    if 'experiences' in data:
        Experience.query.filter_by(profile_id=profile.id).delete()
        for exp in data['experiences']:
            if exp.get('title') or exp.get('company'):  # Only add if has title or company
                db.session.add(Experience(
                    profile_id=profile.id,
                    title=exp.get('title', ''),
                    company=exp.get('company', ''),
                    start_date=exp.get('start_date'),
                    end_date=exp.get('end_date'),
                    description=exp.get('description', '')
                ))
    
    # Education
    if 'educations' in data:
        Education.query.filter_by(profile_id=profile.id).delete()
        for ed in data['educations']:
            if ed.get('school') or ed.get('degree'):  # Only add if has school or degree
                db.session.add(Education(
                    profile_id=profile.id,
                    school=ed.get('school', ''),
                    degree=ed.get('degree', ''),
                    field=ed.get('field', ''),
                    start_date=ed.get('start_date'),
                    end_date=ed.get('end_date')
                ))
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

@profile_bp.route('/image', methods=['POST', 'OPTIONS'])
@jwt_required()
def upload_profile_image():
    if request.method == 'OPTIONS':
        return '', 200
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    success, result = save_uploaded_file(file)
    
    if not success:
        return jsonify({'error': result}), 400
    
    # Delete old profile image if exists
    if user.profile_image:
        delete_profile_image(user.profile_image)
    
    # Update user profile image
    user.profile_image = result
    db.session.commit()
    
    return jsonify({
        'message': 'Profile image uploaded successfully',
        'image_url': result
    }), 200

@profile_bp.route('/', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_profile():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Delete related profile, skills, experiences, educations
    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile:
        Skill.query.filter_by(profile_id=profile.id).delete()
        Experience.query.filter_by(profile_id=profile.id).delete()
        Education.query.filter_by(profile_id=profile.id).delete()
        db.session.delete(profile)
    # Delete user
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Account deleted successfully'}), 200

# Remove duplicate routes - images are now served at root level in main.py 