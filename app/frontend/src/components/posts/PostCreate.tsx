import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from './api';

interface PostFormData {
  content: string;
  title: string;
  tags: string[];
  media: File | null;
  mediaType: 'image' | 'video' | 'gif';
}

const PostCreate: React.FC = () => {
  const [formData, setFormData] = useState<PostFormData>({
    content: '',
    title: '',
    tags: [],
    media: null,
    mediaType: 'image'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, content: e.target.value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, media: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ 
      ...prev, 
      mediaType: e.target.value as 'image' | 'video' | 'gif',
      media: null 
    }));
    setMediaPreview(null);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const removeMedia = () => {
    setFormData(prev => ({ ...prev, media: null }));
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    if (!formData.content.trim()) {
      setError('Post content is required');
      return false;
    }
    
    if (formData.content.length > 10000) {
      setError('Post content is too long (max 10,000 characters)');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('content', formData.content);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      
      formDataToSend.append('media_type', formData.mediaType);
      if (formData.media) {
        formDataToSend.append('media', formData.media);
      }
      
      await postsApi.createPost(formDataToSend);
      navigate('/posts');
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatContent = (content: string) => {
    // Simple formatting for preview
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/posts')}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Posts
          </button>
          <h1 className="text-3xl font-bold text-gray-900 tracking-wider" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Create Post
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Creation Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Post Content
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter post title..."
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  maxLength={200}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Content *</label>
                <div className="relative">
                  <textarea
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Share your thoughts... (Use **bold** and *italic* for formatting)"
                    rows={8}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
                    maxLength={10000}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.content.length}/10000
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Formatting: <strong>**bold**</strong> and <em>*italic*</em></p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleAddTag}
                  placeholder="Type a tag and press Enter..."
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200 flex items-center"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-amber-500 hover:text-amber-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Media Upload */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Media</label>
                <div className="space-y-3">
                  <select
                    value={formData.mediaType}
                    onChange={handleMediaTypeChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="gif">GIF</option>
                  </select>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      formData.mediaType === 'image' ? 'image/*' :
                      formData.mediaType === 'video' ? 'video/*' :
                      'image/gif'
                    }
                    onChange={handleMediaChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition-colors"
                  />
                  
                  {mediaPreview && (
                    <div className="relative">
                      <div className="border border-gray-200 rounded-lg p-3">
                        {formData.mediaType === 'video' ? (
                          <video
                            src={mediaPreview}
                            controls
                            className="w-full max-h-64 object-cover rounded"
                          />
                        ) : (
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="w-full max-h-64 object-cover rounded"
                          />
                        )}
                        <button
                          type="button"
                          onClick={removeMedia}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    'Create Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Preview
            </h2>
            
            <div className="space-y-4">
              {/* Post Header */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                  <span className="text-amber-700 font-semibold">B</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Boss User</div>
                  <div className="text-sm text-gray-500">Just now</div>
                </div>
              </div>

              {/* Post Content */}
              {formData.title && (
                <h3 className="text-lg font-semibold text-gray-900">{formData.title}</h3>
              )}
              
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatContent(formData.content) }}
              />

              {/* Media Preview */}
              {mediaPreview && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {formData.mediaType === 'video' ? (
                    <video
                      src={mediaPreview}
                      controls
                      className="w-full max-h-96 object-cover"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Post media"
                      className="w-full max-h-96 object-cover"
                    />
                  )}
                </div>
              )}

              {/* Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement Placeholder */}
              <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>0</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>0</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCreate; 