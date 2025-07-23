import os
import uuid
from datetime import datetime
from PIL import Image
from werkzeug.utils import secure_filename
from ..config import Config

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename):
    """Generate a unique filename with timestamp and UUID"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    extension = original_filename.rsplit('.', 1)[1].lower()
    return f"{timestamp}_{unique_id}.{extension}"

def process_image(image_path, max_size=(800, 800), thumbnail_size=(200, 200)):
    """Process uploaded image: resize and create thumbnail"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Resize main image if too large
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save processed main image
            img.save(image_path, 'JPEG', quality=85, optimize=True)
            
            # Create thumbnail
            thumbnail_path = image_path.replace('.', '_thumb.')
            img.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)
            img.save(thumbnail_path, 'JPEG', quality=80, optimize=True)
            
            return True, None
    except Exception as e:
        return False, str(e)

def save_uploaded_file(file):
    """Save uploaded file with validation and processing"""
    if not file or file.filename == '':
        return False, "No file selected"
    
    if not allowed_file(file.filename):
        return False, "File type not allowed. Please upload PNG, JPG, JPEG, or GIF"
    
    try:
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        
        # Save file
        file.save(filepath)
        
        # Process image
        success, error = process_image(filepath)
        if not success:
            # Remove file if processing failed
            if os.path.exists(filepath):
                os.remove(filepath)
            return False, f"Image processing failed: {error}"
        
        # Return relative URL for database storage
        return True, f"/uploads/{filename}"
        
    except Exception as e:
        return False, f"File upload failed: {str(e)}"

def delete_profile_image(image_url):
    """Delete profile image and its thumbnail"""
    if not image_url:
        return True
    
    try:
        # Extract filename from URL
        filename = image_url.split('/')[-1]
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        thumbnail_path = filepath.replace('.', '_thumb.')
        
        # Delete main image
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Delete thumbnail
        if os.path.exists(thumbnail_path):
            os.remove(thumbnail_path)
        
        return True
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False 