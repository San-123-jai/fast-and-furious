import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
import magic
from config import Config

class MediaProcessor:
    """Handle media file uploads, validation, and processing"""
    
    # Allowed file types and their MIME types
    ALLOWED_EXTENSIONS = {
        'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
        'video': {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'},
        'gif': {'gif'}
    }
    
    MIME_TYPES = {
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'video': ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm'],
        'gif': ['image/gif']
    }
    
    # File size limits (in bytes)
    MAX_FILE_SIZES = {
        'image': 10 * 1024 * 1024,  # 10MB
        'video': 100 * 1024 * 1024,  # 100MB
        'gif': 20 * 1024 * 1024  # 20MB
    }
    
    @staticmethod
    def validate_file(file, media_type='image'):
        """Validate uploaded file"""
        if not file:
            return False, "No file provided"
        
        # Check file extension
        filename = secure_filename(file.filename)
        if not filename:
            return False, "Invalid filename"
        
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        if file_ext not in MediaProcessor.ALLOWED_EXTENSIONS.get(media_type, set()):
            return False, f"File type not allowed for {media_type}. Allowed: {', '.join(MediaProcessor.ALLOWED_EXTENSIONS.get(media_type, []))}"
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        max_size = MediaProcessor.MAX_FILE_SIZES.get(media_type, 10 * 1024 * 1024)
        if file_size > max_size:
            return False, f"File too large. Max size: {max_size // (1024 * 1024)}MB"
        
        # Check MIME type
        mime_type = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)  # Reset file pointer
        
        allowed_mimes = MediaProcessor.MIME_TYPES.get(media_type, [])
        if mime_type not in allowed_mimes:
            return False, f"Invalid file type. Expected {media_type}, got {mime_type}"
        
        return True, "File is valid"
    
    @staticmethod
    def save_media_file(file, media_type='image'):
        """Save media file and return metadata"""
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        file_ext = secure_filename(file.filename).rsplit('.', 1)[1].lower()
        filename = f"{timestamp}_{unique_id}.{file_ext}"
        
        # Create media-specific directory
        media_dir = os.path.join(Config.UPLOAD_FOLDER, media_type)
        os.makedirs(media_dir, exist_ok=True)
        
        filepath = os.path.join(media_dir, filename)
        
        # Save file
        file.save(filepath)
        
        # Generate metadata
        metadata = MediaProcessor.generate_metadata(filepath, media_type)
        
        # Return file info
        return {
            'filename': filename,
            'filepath': filepath,
            'url': f'/uploads/{media_type}/{filename}',
            'media_type': media_type,
            'metadata': metadata
        }
    
    @staticmethod
    def generate_metadata(filepath, media_type):
        """Generate metadata for media file"""
        metadata = {
            'file_size': os.path.getsize(filepath),
            'uploaded_at': datetime.now().isoformat()
        }
        
        if media_type == 'image':
            try:
                with Image.open(filepath) as img:
                    metadata.update({
                        'width': img.width,
                        'height': img.height,
                        'format': img.format,
                        'mode': img.mode
                    })
                    
                    # Generate thumbnail for images
                    MediaProcessor.create_thumbnail(filepath, img)
                    
            except Exception as e:
                metadata['error'] = f"Failed to process image: {str(e)}"
        
        elif media_type == 'video':
            # For videos, we could add video-specific metadata
            # This would require additional libraries like ffmpeg-python
            metadata['video_processed'] = False  # Placeholder
        
        return metadata
    
    @staticmethod
    def create_thumbnail(filepath, img):
        """Create thumbnail for image"""
        try:
            # Create thumbnail directory
            thumb_dir = os.path.join(Config.UPLOAD_FOLDER, 'thumbnails')
            os.makedirs(thumb_dir, exist_ok=True)
            
            # Generate thumbnail filename
            filename = os.path.basename(filepath)
            name, ext = os.path.splitext(filename)
            thumb_filename = f"{name}_thumb{ext}"
            thumb_path = os.path.join(thumb_dir, thumb_filename)
            
            # Create thumbnail (300x300 max)
            img.thumbnail((300, 300), Image.Resampling.LANCZOS)
            img.save(thumb_path, quality=85, optimize=True)
            
        except Exception as e:
            print(f"Failed to create thumbnail: {e}")
    
    @staticmethod
    def delete_media_file(filepath):
        """Delete media file and its thumbnail"""
        try:
            # Delete main file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            # Delete thumbnail if exists
            filename = os.path.basename(filepath)
            name, ext = os.path.splitext(filename)
            thumb_path = os.path.join(Config.UPLOAD_FOLDER, 'thumbnails', f"{name}_thumb{ext}")
            if os.path.exists(thumb_path):
                os.remove(thumb_path)
                
            return True
        except Exception as e:
            print(f"Failed to delete media file: {e}")
            return False 