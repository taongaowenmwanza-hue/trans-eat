import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.43.95:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

export const authAPI = {
  sendOTP: (email: string) =>
    api.post('/auth/send-otp', { email }),
  verifyOTP: (email: string, otp: string, partner?: boolean) =>
    api.post('/auth/verify-otp', { email, otp }, { params: { partner: partner || false } }),
  getMe: () =>
    api.get('/auth/me'),
  logout: () =>
    api.post('/auth/logout'),
};

export const restaurantsAPI = {
  getAll: (town?: string, cuisine?: string) =>
    api.get('/restaurants/', { params: { town, cuisine } }),
};

export default api;
