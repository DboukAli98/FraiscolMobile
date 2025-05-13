// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  res => res,
  err => {
    // parse out network or API errors
    return Promise.reject(err.response?.data ?? err);
  }
);

export default apiClient;
