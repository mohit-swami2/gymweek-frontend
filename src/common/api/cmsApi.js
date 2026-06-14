import { adminApi } from './client.js';
import { API_BASE_URL } from '../../config/api.js';

const crud = (basePath) => ({
  list: (params) => adminApi.get(basePath, { params }),
  get: (id) => adminApi.get(`${basePath}/${id}`),
  create: (data) => adminApi.post(basePath, data),
  update: (id, data) => adminApi.patch(`${basePath}/${id}`, data),
  remove: (id) => adminApi.delete(`${basePath}/${id}`),
});

export const usersApi = crud('/users');
export const testimonialsApi = crud('/cms/testimonials');
export const emailTemplatesApi = crud('/cms/email-templates');
export const termsApi = crud('/cms/terms');
export const privacyApi = crud('/cms/privacy');
export const sectionsApi = {
  ...crud('/cms/sections'),
  update: (id, data) => adminApi.patch(`/cms/sections/id/${id}`, data),
  remove: (id) => adminApi.delete(`/cms/sections/id/${id}`),
  upsertByKey: (key, data) => adminApi.put(`/cms/sections/${key}`, data),
};

export const exercisesApi = {
  ...crud('/exercises'),
  getMuscleGroups: () => adminApi.get('/exercises/muscle-groups'),
};

export const dashboardApi = {
  getStats: () => adminApi.get('/dashboard/stats'),
  exportReport: () => adminApi.get('/dashboard/export'),
};

export const uploadAdminFile = async (file, folder = 'admin') => {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  const token = localStorage.getItem('gymweek_admin_token');
  const base = API_BASE_URL;
  const res = await fetch(`${base}/api/admin/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Upload failed');
  return body.data?.[0];
};
