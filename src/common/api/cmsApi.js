import { adminApi } from './client.js';

const crud = (basePath) => ({
  list: (params) => adminApi.get(basePath, { params }),
  get: (id) => adminApi.get(`${basePath}/${id}`),
  create: (data) => adminApi.post(basePath, data),
  update: (id, data) => adminApi.patch(`${basePath}/${id}`, data),
  remove: (id) => adminApi.delete(`${basePath}/${id}`),
});

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
