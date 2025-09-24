// 🌐 BLOCKCHAIN SUPPLY CHAIN API SERVICE
// Professional API service with full error handling and type safety

import axios, { AxiosResponse } from 'axios';
import { 
  User, 
  Product, 
  AuthResponse, 
  CreateProductRequest, 
  UpdateProductRequest,
  ProductHistory,
  BlockchainBlock,
  UserRole
} from '@/types';

// 🔧 API Configuration
const DEFAULT_API_BASE_URL = 'http://127.0.0.1:5000';

export function getApiBaseUrl() {
  // 1) URL query param takes top priority (and persists)
  try {
    const url = new URL(window.location.href);
    const fromParam = url.searchParams.get('api_base_url');
    if (fromParam) {
      localStorage.setItem('api_base_url', fromParam);
      return fromParam;
    }
  } catch {}

  // 2) Explicit global override on window (useful when embedding)
  try {
    const fromWindow = (window as any)?.__API_BASE_URL as string | undefined;
    if (fromWindow) return fromWindow;
  } catch {}

  // 3) Vite env var (build-time)
  try {
    const fromEnv = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    if (fromEnv) return fromEnv;
  } catch {}

  // 4) Persisted choice or default
  return localStorage.getItem('api_base_url') || DEFAULT_API_BASE_URL;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Request Interceptor - Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Response Interceptor - Handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// 🔥 API SERVICES

// 🔐 Authentication Services
export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { username, password });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async register(username: string, password: string, role: UserRole): Promise<{ message: string; user: User }> {
    const { data } = await api.post('/api/auth/register', { username, password, role });
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/api/auth/me');
    return data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  },

  async getAllUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/api/auth/users');
    return data;
  },

  async deleteUser(username: string, cascade: boolean = false): Promise<any> {
    const { data } = await api.delete(`/api/auth/users/${username}?cascade=${cascade}`);
    return data;
  }
};

// 👥 User Services
export const userService = {
  async getUsersByRole(role: UserRole): Promise<{ username: string }[]> {
    const { data } = await api.get(`/api/users/list_by_role?role=${role}`);
    return data;
  }
};

// 📦 Product Services  
export const productService = {
  async createProduct(productData: CreateProductRequest): Promise<any> {
    const { data } = await api.post('/api/products/', productData);
    return data;
  },

  async updateProduct(updateData: UpdateProductRequest): Promise<any> {
    const { data } = await api.post('/api/products/update', updateData);
    return data;
  },

  async getProduct(productId: string): Promise<Product> {
    const { data } = await api.get<Product>(`/api/products/${productId}`);
    return data;
  },

  async getProducts(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    owner?: string;
    sort?: string;
  }): Promise<{ page: number; per_page: number; total: number; products: Product[] }> {
    const { data } = await api.get('/api/products/', { params });
    return data;
  },

  async searchProducts(query: string): Promise<Product[]> {
    const { data } = await api.get(`/api/products/search?query=${encodeURIComponent(query)}`);
    return data;
  },

  async deleteProduct(productId: string): Promise<any> {
    const { data } = await api.delete(`/api/products/${productId}`);
    return data;
  },

  async getProductHistory(productId: string): Promise<ProductHistory> {
    const { data } = await api.get<ProductHistory>(`/api/products/${productId}/history`);
    return data;
  },

  async getQRCode(productId: string): Promise<Blob> {
    const response = await api.get(`/api/products/${productId}/qrcode`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportProductHistory(productId: string): Promise<Blob> {
    const response = await api.get(`/api/products/${productId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// ⛓️ Blockchain Services
export const blockchainService = {
  async getFullChain(): Promise<{ chain: BlockchainBlock[]; valid: boolean; message: string }> {
    const { data } = await api.get('/api/chain/');
    return data;
  },

  async validateChain(): Promise<{ valid: boolean; message: string }> {
    const { data } = await api.get('/api/chain/validate');
    return data;
  },

  async getProductBlockchain(productId: string): Promise<BlockchainBlock[]> {
    const { data } = await api.get(`/api/products/blockchain/${productId}`);
    return data;
  },

  async getAllProductsBlockchain(): Promise<BlockchainBlock[]> {
    const { data } = await api.get('/api/products/blockchain');
    return data;
  },

  async verifyBlockchain(): Promise<{ valid: boolean; message: string }> {
    const { data } = await api.get('/api/products/blockchain/verify');
    return data;
  }
};

// 🌍 Geolocation Service
export const locationService = {
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
};

export default api;