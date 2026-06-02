import { getAuthToken } from './auth';

const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export const apiRequest = async <T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    params?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> => {
  const { method = 'GET', body, params } = options;

  // 1. Build Query Parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }

  // 2. Set Headers (Include JWT Bearer Token)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || ['An unexpected error occurred.'],
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error: any) {
    console.error('API Call Error:', error);
    return {
      success: false,
      errors: ['Failed to connect to the backend server. Please verify it is running.'],
    };
  }
};
