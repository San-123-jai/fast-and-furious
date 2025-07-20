import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from './api';
import type { Post } from './api';

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
    // Get current user from localStorage or token
    getCurrentUser();
  }, [currentPage]);

  const getCurrentUser = () => {
    // Try to get user from localStorage first
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        console.log('Current user from localStorage:', user);
        return;
      } catch (e) {
        console.error('Failed to parse user data from localStorage:', e);
      }
    }

    // If no user in localStorage, try to get from token
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('User from token payload:', payload);
        // Get user info from the API instead of using fallback
        fetchUserFromToken(payload.sub);
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
  };

  const fetchUserFromToken = async (userId: string) => {
    try {
      // Fetch user profile from the API
      const response = await fetch(`http://localhost:5000/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        // Store the user data in localStorage for future use
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User fetched from API:', userData);
      } else {
        console.error('Failed to fetch user data from API');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsApi.getPosts(currentPage, 10);
      setPosts(response.posts);
      setPagination(response.pagination);
      console.log('Fetched posts:', response.posts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await postsApi.likePost(postId);
      // Update the post in the list
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        )
      );
    } catch (err: any) {
      console.error('Failed to like post:', err);
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await postsApi.deletePost(postId);
      // Remove the post from the list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setDeleteConfirm(null);
      // Show success message
      alert('Post deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  const confirmDelete = (postId: number) => {
    setDeleteConfirm(postId);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const renderMedia = (post: Post) => {
    if (!post.media_url) return null;

    const mediaUrl = `http://localhost:5000${post.media_url}`;

    if (post.media_type === 'video') {
      return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <video
            src={mediaUrl}
            controls
            className="w-full max-h-96 object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <img
            src={mediaUrl}
            alt="Post media"
            className="w-full max-h-96 object-cover"
          />
        </div>
      );
    }
  };

  // Check if current user is the post author
  const isPostAuthor = (post: Post) => {
    if (!currentUser) {
      console.log('No current user found');
      return false;
    }
    
    const isAuthor = currentUser.id === post.user_id;
    console.log(`Post ${post.id}: User ID ${currentUser.id} vs Post User ID ${post.user_id} = ${isAuthor}`);
    return isAuthor;
  };

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-wider" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Posts
          </h1>
          <div className="flex items-center space-x-3">
            <Link
              to="/profile"
              className="bg-gradient-to-r from-slate-600 to-gray-700 text-white px-6 py-3 rounded-lg hover:from-slate-700 hover:to-gray-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profile
            </Link>
            <Link
              to="/posts/create"
              className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Create Post
            </Link>
          </div>
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

        {/* Debug Info - Remove in production */}
        {currentUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Debug:</strong> Current User ID: {currentUser.id} | Username: {currentUser.username || 'N/A'} | Name: {currentUser.first_name || ''} {currentUser.last_name || ''} | Email: {currentUser.email || 'N/A'}
            </p>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share something amazing!</p>
            <Link
              to="/posts/create"
              className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 font-semibold"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow relative">
              {/* Delete Button - Only show for post author */}
              {isPostAuthor(post) && (
                <div className="absolute top-4 right-4">
                  {deleteConfirm === post.id ? (
                    <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-2">
                      <span className="text-xs text-red-700 font-medium">Delete?</span>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded bg-red-100 hover:bg-red-200 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="text-gray-600 hover:text-gray-800 text-xs font-medium px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmDelete(post.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                      title="Delete post"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Debug Info for each post - Remove in production */}
              <div className="absolute top-4 left-4 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                <span className="text-xs text-yellow-700">
                  Post ID: {post.id} | User ID: {post.user_id} | Is Author: {isPostAuthor(post) ? 'Yes' : 'No'}
                </span>
              </div>

              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                  {post.user?.profile_image ? (
                    <img
                      src={`http://localhost:5000${post.user.profile_image}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-amber-700 font-semibold">
                      {post.user?.first_name?.[0] || post.user?.username?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {post.user?.first_name && post.user?.last_name
                      ? `${post.user.first_name} ${post.user.last_name}`
                      : post.user?.username || 'Unknown User'
                    }
                  </div>
                  <div className="text-sm text-gray-500">{formatDate(post.created_at)}</div>
                </div>
              </div>

              {/* Post Title */}
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{post.title}</h3>
              )}

              {/* Post Content */}
              <div 
                className="text-gray-700 leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
              />

              {/* Media */}
              {renderMedia(post)}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes_count}</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments_count}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>{post.shares_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.views_count} views</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} posts
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.has_prev}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.has_next}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostList; 