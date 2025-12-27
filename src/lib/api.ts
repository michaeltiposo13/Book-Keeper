import axios, { AxiosInstance, AxiosError } from 'axios';

// API Base URL - defaults to Laravel backend on port 8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found for request to:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    if (response.config.url?.includes('/books') || response.config.url?.includes('/categories') || response.config.url?.includes('/suppliers')) {
      console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error: AxiosError) => {
    // Don't redirect on 401 for login/register endpoints
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    
    console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Unauthorized - clear token and redirect to login
      console.log('Unauthorized access, redirecting to login');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('library_user');
      window.location.href = '/login';
    }
    
    // Log network errors for debugging
    if (!error.response) {
      console.error('Network error:', error.message);
      console.error('API Base URL:', API_BASE_URL);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    joined_date: string;
  }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// Books API
export const booksAPI = {
  getAll: async (params?: {
    search?: string;
    category_id?: number;
    supplier_id?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/books', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    isbn: string;
    category_id: number;
    supplier_id: number;
    content?: string;
  }) => {
    const response = await apiClient.post('/books', data);
    return response.data;
  },

  update: async (id: number, data: {
    title?: string;
    isbn?: string;
    category_id?: number;
    supplier_id?: number;
    content?: string;
  }) => {
    const response = await apiClient.put(`/books/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/books/${id}`);
    return response.data;
  },
};

// Borrowers API
export const borrowersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/borrowers');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/borrowers/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    joined_date: string;
  }) => {
    const response = await apiClient.post('/borrowers', data);
    return response.data;
  },

  update: async (id: number, data: {
    name?: string;
    email?: string;
    password?: string;
    joined_date?: string;
  }) => {
    const response = await apiClient.put(`/borrowers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/borrowers/${id}`);
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: { category_name: string }) => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: { category_name: string }) => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};

// Suppliers API
export const suppliersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/suppliers');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: {
    supplier_name: string;
    contact_info?: string;
  }) => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: {
    supplier_name?: string;
    contact_info?: string;
  }) => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },
};

// Request Books API
export const requestBooksAPI = {
  getAll: async (params?: {
    borrower_id?: number;
    book_id?: number;
    approval_status?: string;
  }) => {
    const response = await apiClient.get('/request-books', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/request-books/${id}`);
    return response.data;
  },

  create: async (data: {
    borrower_id: number;
    book_id: number;
    request_date: string;
    approval_status?: string;
    quantity?: number;
  }) => {
    const response = await apiClient.post('/request-books', data);
    return response.data;
  },

  update: async (id: number, data: {
    borrower_id?: number;
    book_id?: number;
    request_date?: string;
    approval_status?: string;
    quantity?: number;
  }) => {
    const response = await apiClient.put(`/request-books/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/request-books/${id}`);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (params?: {
    request_id?: number;
    paid_status?: string;
    payment_method?: string;
  }) => {
    const response = await apiClient.get('/payments', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },

  create: async (data: {
    request_id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    payment_type: string;
    paid_status: string;
  }) => {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  update: async (id: number, data: {
    request_id?: number;
    amount?: number;
    payment_date?: string;
    payment_method?: string;
    payment_type?: string;
    paid_status?: string;
  }) => {
    const response = await apiClient.put(`/payments/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/payments/${id}`);
    return response.data;
  },
};

// Book Authors API
export const bookAuthorsAPI = {
  getAll: async (params?: {
    book_id?: number;
    search?: string;
  }) => {
    const response = await apiClient.get('/book-authors', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/book-authors/${id}`);
    return response.data;
  },

  create: async (data: {
    book_id: number;
    author_name: string;
    bio?: string;
  }) => {
    const response = await apiClient.post('/book-authors', data);
    return response.data;
  },

  update: async (id: number, data: {
    book_id?: number;
    author_name?: string;
    bio?: string;
  }) => {
    const response = await apiClient.put(`/book-authors/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/book-authors/${id}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStatistics: async () => {
    const response = await apiClient.get('/dashboard/statistics');
    return response.data;
  },

  getOverdueBooks: async () => {
    const response = await apiClient.get('/dashboard/overdue-books');
    return response.data;
  },

  getMonthlyStats: async () => {
    const response = await apiClient.get('/dashboard/monthly-stats');
    return response.data;
  },
};

export default apiClient;

