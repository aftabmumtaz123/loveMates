import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const errorMessage = (e: unknown) =>
  axios.isAxiosError(e)
    ? (e.response?.data?.message || 'Something went wrong.')
    : e instanceof Error
      ? e.message
      : 'Something went wrong.';
