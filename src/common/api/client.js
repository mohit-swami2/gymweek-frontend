import axios from 'axios';

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
    (res) => parseResponse(res.data),
    (error) => Promise.reject(new Error(error.response?.data?.message || error.message))
  );

  return client;
};

const API_BASE = import.meta.env.VITE_API_URL || '';

export const websiteApi = createClient(`${API_BASE}/api/website`, 'gymweek_user_token');
export const adminApi = createClient(`${API_BASE}/api/admin`, 'gymweek_admin_token');

// Legacy alias
export const apiClient = websiteApi;
