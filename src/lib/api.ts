import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Vercel can proxy the API across deployments. Keep the JWT as a fallback
// authorization header so authentication does not depend on cross-deployment
// cookie forwarding. The HttpOnly cookie remains enabled as well.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('couplenest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const saveAuthToken = (token?: string) => {
  if (token) localStorage.setItem('couplenest_token', token);
};

export const clearAuthToken = () => localStorage.removeItem('couplenest_token');

export const errorMessage = (e: unknown) =>
  axios.isAxiosError(e)
    ? (e.response?.data?.message || 'Something went wrong.')
    : e instanceof Error
      ? e.message
      : 'Something went wrong.';
