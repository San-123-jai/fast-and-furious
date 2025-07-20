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
}

export const postsApi = {
  // Get all posts with pagination
  async getPosts(page = 1, perPage = 10, userId?: number): Promise<PostsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    if (userId) {
      params.append('user_id', userId.toString());
    }
    
    const response = await apiClient.get(`/posts/?${params}`);
    return response.data;
  },

  // Get a specific post
  async getPost(postId: number): Promise<{ post: Post }> {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  // Create a new post with optional media upload
  async createPost(formData: FormData): Promise<{ message: string; post: Post }> {
    const response = await apiClient.post('/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a post
  async updatePost(postId: number, data: Partial<Post>): Promise<{ message: string; post: Post }> {
    const response = await apiClient.put(`/posts/${postId}`, data);
    return response.data;
  },

  // Delete a post
  async deletePost(postId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  },

  // Like a post
  async likePost(postId: number): Promise<{ message: string; likes_count: number }> {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  }
}; 