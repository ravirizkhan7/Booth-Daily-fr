import api from '../utils/axios';
import { User } from '../types';

export const userService = {
  async login(email: string, password?: string): Promise<{ user?: User; token?: string }> {
    const response = await api.post('/auth/login', { email, password });
    const resData = response.data;
    const token = resData.token || resData.access_token || resData.data?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    const user = resData.user || resData.data?.user || resData.data;
    return { user, token };
  },

  async loginByPin(pin: string): Promise<{ user?: User; token?: string }> {
    const response = await api.post('/auth/login-pin', { pin });
    const resData = response.data;
    const token = resData.token || resData.access_token || resData.data?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    const user = resData.user || resData.data?.user || resData.data;
    return { user, token };
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data || response.data.user || response.data;
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  },

  async verifyPin(pin: string): Promise<User | null> {
    try {
      const result = await this.loginByPin(pin);
      return result.user || null;
    } catch {
      return null;
    }
  },

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data.data || response.data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data || response.data;
  },

  async deleteUser(id: string): Promise<boolean> {
    await api.delete(`/users/${id}`);
    return true;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the API call fails, we still clear local state
    }
    localStorage.removeItem('token');
  }
};
