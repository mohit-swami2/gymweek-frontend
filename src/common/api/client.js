import axios from 'axios';
import { API_BASE_URL, ADMIN_API_BASE, WEBSITE_API_BASE } from '../../config/api.js';

const parseResponse = (body) => ({
  data: body.data ?? [],
  message: body.message,
  meta: {
    page: body.page,
    total: body.total,
    limit: body.limit,
    totalPages: body.totalPages,
    sort: body.sort,
  },
});

const createClient = (baseURL, tokenKey) => {
  const client = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(tokenKey);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => {
      if (res.config.responseType === 'blob') return res.data;
      return parseResponse(res.data);
    },
    (error) => Promise.reject(new Error(error.response?.data?.message || error.message))
  );

  return client;
};

const API_BASE = API_BASE_URL;

export const websiteApi = createClient(WEBSITE_API_BASE, 'gymweek_user_token');
export const adminApi = createClient(ADMIN_API_BASE, 'gymweek_admin_token');

// Legacy alias
export const apiClient = websiteApi;
