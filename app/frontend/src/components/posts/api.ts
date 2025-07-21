import { apiClient } from '../../services/api';

export interface Post {
  id: number;
  user_id: number;
  content: string;
  media_url?: string;
  media_type?: string;
  media_metadata?: any;
  title?: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_image?: string;
  };
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters?: {
    search: string;
    category: string;
    tags: string;
    visibility: string;
    sort_by: string;
    sort_order: string;
  };
}

export interface Category {
  name: string;
  count: number;
  slug: string;
}

export interface PopularTag {
  tag: string;
  count: number;
  slug: string;
}

export interface PostsStats {
  total_posts: number;
  featured_posts: number;
  recent_posts: number;
  total_likes: number;
  total_views: number;
}

export interface PostsFilters {
  search?: string;
  category?: string;
  tags?: string;
  visibility?: string;
  sort_by?: string;
  sort_order?: string;
  user_id?: number;
}

export const postsApi = {
  // Get all posts with advanced filtering and pagination
  async getPosts(
    page = 1, 
    perPage = 10, 
    filters: PostsFilters = {}
  ): Promise<PostsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    // Add filter parameters
    if (filters.user_id) {
      params.append('user_id', filters.user_id.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.tags) {
      params.append('tags', filters.tags);
    }
    if (filters.visibility) {
      params.append('visibility', filters.visibility);
    }
    if (filters.sort_by) {
      params.append('sort_by', filters.sort_by);
    }
    if (filters.sort_order) {
      params.append('sort_order', filters.sort_order);
    }
    
    const response = await apiClient.get(`/api/posts/?${params}`);
    return response.data;
  },

  // Get categories
  async getCategories(): Promise<{ categories: Category[] }> {
    const response = await apiClient.get('/api/posts/categories');
    return response.data;
  },

  // Get popular tags
  async getPopularTags(): Promise<{ popular_tags: PopularTag[] }> {
    const response = await apiClient.get('/api/posts/popular-tags');
    return response.data;
  },

  // Get posts statistics
  async getStats(): Promise<{ stats: PostsStats }> {
    const response = await apiClient.get('/api/posts/stats');
    return response.data;
  },

  // Get a specific post
  async getPost(postId: number): Promise<{ post: Post }> {
    const response = await apiClient.get(`/api/posts/${postId}`);
    return response.data;
  },

  // Create a new post with optional media upload
  async createPost(formData: FormData): Promise<{ message: string; post: Post }> {
    const response = await apiClient.post('/api/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a post
  async updatePost(postId: number, data: Partial<Post>): Promise<{ message: string; post: Post }> {
    const response = await apiClient.put(`/api/posts/${postId}`, data);
    return response.data;
  },

  // Delete a post
  async deletePost(postId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/api/posts/${postId}`);
    return response.data;
  },

  // Like a post
  async likePost(postId: number): Promise<{ message: string; likes_count: number }> {
    const response = await apiClient.post(`/api/posts/${postId}/like`);
    return response.data;
  }
}; 