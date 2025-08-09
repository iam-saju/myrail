import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login or refresh page
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar: string | null;
  verified: boolean;
  followers_count: number;
  following_count: number;
  total_likes: number;
  total_views: number;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  description: string;
  featured_image: string | null;
  has_3d_model: boolean;
  model_type: string;
  posts_count: number;
  visits_count: number;
  is_trending: boolean;
  created_at: string;
}

export interface TravelPost {
  id: string;
  user: User;
  destination: Destination;
  video: string;
  thumbnail: string | null;
  description: string;
  music_name: string;
  music_artist: string;
  featured_3d: boolean;
  is_featured: boolean;
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  tags: string[];
  is_liked: boolean;
  time_ago: string;
  created_at: string;
}

export interface ApiResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
  has_next?: boolean;
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>) => {
    const response = await api.patch('/users/profile/', userData);
    return response.data;
  },
};

// Posts API
export const postsAPI = {
  getFeed: async (offset: number = 0, pageSize: number = 10) => {
    const response = await api.get(`/feed/?offset=${offset}&page_size=${pageSize}`);
    return response.data;
  },

  getPosts: async (params: {
    page?: number;
    user?: string;
    destination?: string;
    tags?: string;
    feed?: 'latest' | 'trending' | 'following' | '3d';
  } = {}) => {
    const response = await api.get('/posts/', { params });
    return response.data;
  },

  getPost: async (id: string) => {
    const response = await api.get(`/posts/${id}/`);
    return response.data;
  },

  createPost: async (postData: FormData) => {
    const response = await api.post('/posts/', postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  likePost: async (id: string) => {
    const response = await api.post(`/posts/${id}/like/`);
    return response.data;
  },

  sharePost: async (id: string, platform: string = 'native') => {
    const response = await api.post(`/posts/${id}/share/`, { platform });
    return response.data;
  },

  getComments: async (postId: string) => {
    const response = await api.get(`/posts/${postId}/comments/`);
    return response.data;
  },

  addComment: async (postId: string, content: string) => {
    const response = await api.post(`/posts/${postId}/comments/`, { content });
    return response.data;
  },
};

// Destinations API
export const destinationsAPI = {
  getDestinations: async (params: {
    page?: number;
    search?: string;
    country?: string;
    has_3d?: boolean;
  } = {}) => {
    const response = await api.get('/destinations/', { params });
    return response.data;
  },

  getDestination: async (id: string) => {
    const response = await api.get(`/destinations/${id}/`);
    return response.data;
  },

  getTrending: async () => {
    const response = await api.get('/destinations/trending/');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUser: async (username: string) => {
    const response = await api.get(`/users/${username}/`);
    return response.data;
  },

  followUser: async (userId: string) => {
    const response = await api.post(`/users/${userId}/follow/`);
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/users/preferences/');
    return response.data;
  },

  updatePreferences: async (preferences: any) => {
    const response = await api.patch('/users/preferences/', preferences);
    return response.data;
  },
};

// Search API
export const searchAPI = {
  search: async (query: string) => {
    const response = await api.get(`/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getPopularTags: async () => {
    const response = await api.get('/tags/popular/');
    return response.data;
  },
};

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default api;