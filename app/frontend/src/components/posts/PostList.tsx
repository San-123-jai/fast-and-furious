import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { postsApi, type Post, type Category, type PopularTag, type PostsFilters } from './api';
import { useDebounce } from '../../hooks/useDebounce';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { PostSkeleton, Skeleton } from '../ui/Skeleton';
import { LazyImage } from '../ui/LazyImage';

const PostList: React.FC = () => {
  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [notAuthenticated, setNotAuthenticated] = useState(false);
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [debugUser, setDebugUser] = useState<any>(null);
  const [shareMessage, setShareMessage] = useState<{ [postId: number]: boolean }>({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVisibility, setSelectedVisibility] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Get current user and token
  useEffect(() => {
    getCurrentUser();
    setDebugToken(localStorage.getItem('token'));
    try {
      setDebugUser(JSON.parse(localStorage.getItem('user') || 'null'));
    } catch {
      setDebugUser(null);
    }
  }, []);

  // Load initial data only if authenticated
  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadInitialData();
    }
  }, []);

  // Fetch posts when filters change, only if authenticated
  useEffect(() => {
    if (localStorage.getItem('token')) {
      setCurrentPage(1);
      setPosts([]);
      fetchPosts(1, true);
    }
  }, [debouncedSearch, selectedCategory, selectedTags, selectedVisibility, sortBy, sortOrder]);

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse user data from localStorage:', e);
      }
    }
  };

  const loadInitialData = async () => {
    try {
      const [categoriesRes, tagsRes, statsRes] = await Promise.all([
        postsApi.getCategories(),
        postsApi.getPopularTags(),
        postsApi.getStats()
      ]);
      
      setCategories(categoriesRes.categories);
      setPopularTags(tagsRes.popular_tags);
      setStats(statsRes.stats);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setNotAuthenticated(true);
        setError('You are not authenticated. Please log in.');
      } else {
        setError('Failed to load initial data.');
      }
      setLoading(false);
    }
  };

  const fetchPosts = async (page: number, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const filters: PostsFilters = {
        search: debouncedSearch,
        category: selectedCategory,
        tags: selectedTags.join(','),
        visibility: selectedVisibility,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await postsApi.getPosts(page, 10, filters);
      
      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setCurrentPage(page);
      setHasNextPage(response.pagination.has_next);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setNotAuthenticated(true);
        setError('You are not authenticated. Please log in.');
      } else {
        setError(err.message || 'Failed to fetch posts');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      fetchPosts(currentPage + 1);
    }
  }, [loadingMore, hasNextPage, currentPage]);

  // Infinite scroll hook
  const observerRef = useInfiniteScroll({
    hasNextPage,
    isFetching: loadingMore,
    onLoadMore: loadMore
  });

  const handleLike = async (postId: number) => {
    try {
      await postsApi.likePost(postId);
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
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleShare = (postId: number) => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    setShareMessage((prev) => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setShareMessage((prev) => ({ ...prev, [postId]: false }));
    }, 1500);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTags([]);
    setSelectedVisibility('');
    setSortBy('created_at');
    setSortOrder('desc');
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
          <LazyImage
            src={mediaUrl}
            alt="Post media"
            className="w-full max-h-96 object-cover"
          />
        </div>
      );
    }
  };

  const isPostAuthor = (post: Post) => {
    return currentUser?.id === post.user_id;
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedTags.length > 0 || selectedVisibility;

  if (notAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">You are not authenticated</h2>
          <p className="text-red-600 mb-4">Please log in to view posts.</p>
          <button
            onClick={() => { window.location.href = '/login'; }}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="space-y-4">
                <Skeleton lines={3} />
                <Skeleton lines={2} />
                <Skeleton lines={4} />
              </div>
            </div>
          </div>
          
          {/* Posts Skeleton */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-wider" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Posts
            </h1>
            {stats && (
              <p className="text-gray-600 mt-1">
                {stats.total_posts} posts • {stats.total_likes} likes • {stats.total_views} views
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* Search Icon Only */}
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
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

        {/* Debug Info */}
        {currentUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Debug:</strong> Current User ID: {currentUser.id} | Username: {currentUser.username || 'N/A'}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Popular Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Popular Tags</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.slug}
                    onClick={() => handleTagToggle(tag.tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTags.includes(tag.tag)
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.tag} ({tag.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Posts</option>
                <option value="featured">Featured Posts</option>
                <option value="recent">Recent Posts (7 days)</option>
              </select>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent mb-2"
              >
                <option value="created_at">Date Created</option>
                <option value="updated_at">Date Updated</option>
                <option value="likes_count">Likes</option>
                <option value="views_count">Views</option>
                <option value="comments_count">Comments</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    sortOrder === 'desc'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Desc
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    sortOrder === 'asc'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Asc
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h3>
                <div className="space-y-2">
                  {searchTerm && (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-600">Search: "{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {selectedCategory && (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-600">Category: {selectedCategory}</span>
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {selectedTags.map((tag) => (
                    <div key={tag} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-600">Tag: {tag}</span>
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Posts List */}
        <div className="lg:col-span-3">
          {posts.length === 0 && !loading ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more posts."
                  : "Be the first to create a post!"
                }
              </p>
              {!hasActiveFilters && (
                <Link
                  to="/posts/create"
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Create Your First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 flex items-center justify-center text-white font-semibold text-lg">
                        {post.user?.first_name?.[0] || post.user?.username?.[0] || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {post.user?.first_name && post.user?.last_name
                            ? `${post.user.first_name} ${post.user.last_name}`
                            : post.user?.username || 'Unknown User'
                          }
                        </h3>
                        <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                      </div>
                    </div>
                    
                    {/* Post Actions */}
                    <div className="flex items-center space-x-2">
                      {isPostAuthor(post) && (
                        <button
                          onClick={() => setDeleteConfirm(post.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete post"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Title */}
                  {post.title && (
                    <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                      {post.title}
                    </h2>
                  )}

                  {/* Post Content */}
                  <div 
                    className="text-gray-700 mb-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                  />

                  {/* Post Media */}
                  {renderMedia(post)}

                  {/* Post Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-amber-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes_count}</span>
                      </button>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{post.views_count}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments_count}</span>
                      </div>
                      {/* Share Button */}
                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-amber-500 transition-colors relative"
                        title="Share post"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm6 8a3 3 0 11-6 0 3 3 0 016 0zm-6 0a3 3 0 11-6 0 3 3 0 016 0zm6-8v8m-6-4h6" />
                        </svg>
                        <span>Share</span>
                        {shareMessage[post.id] && (
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs rounded px-2 py-1 shadow-lg">Link copied!</span>
                        )}
                      </button>
                    </div>
                    
                    {post.is_featured && (
                      <div className="flex items-center space-x-1 text-amber-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">Featured</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Load More Trigger */}
              {hasNextPage && (
                <div ref={observerRef} className="flex justify-center py-8">
                  {loadingMore ? (
                    <LoadingSpinner size="md" />
                  ) : (
                    <div className="text-gray-500 text-sm">Loading more posts...</div>
                  )}
                </div>
              )}

              {/* End of Posts */}
              {!hasNextPage && posts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>You've reached the end of all posts!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostList; 