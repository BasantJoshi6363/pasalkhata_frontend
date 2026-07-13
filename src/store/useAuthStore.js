import { create } from 'zustand';
import api from '../utils/axiosConfig';

const storedUser = localStorage.getItem('pasalkhata_user');

export const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('pasalkhata_token') || null,
  isLoading: false,
  authError: '',

  register: async (payload) => {
    set({ isLoading: true, authError: '' });
    try {
      const res = await api.post('/auth/register', payload);
      localStorage.setItem('pasalkhata_token', res.data.token);
      localStorage.setItem('pasalkhata_user', JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      set({ authError: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  login: async (payload) => {
    set({ isLoading: true, authError: '' });
    try {
      const res = await api.post('/auth/login', payload);
      localStorage.setItem('pasalkhata_token', res.data.token);
      localStorage.setItem('pasalkhata_user', JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      set({ authError: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('pasalkhata_token');
    localStorage.removeItem('pasalkhata_user');
    set({ user: null, token: null });
  }
}));