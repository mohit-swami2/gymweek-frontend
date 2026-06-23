import { websiteApi } from './client.js';
import { toLocalDateString } from '../utils/dateUtils.js';
import { compressImage } from '../utils/imageCompression.js';

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const fitnessApi = {
  // Dashboard
  getSummary: () => websiteApi.get('/progress/summary'),
  getStats: () => websiteApi.get('/users/stats'),
  getStreak: () => websiteApi.get('/checkins/streak'),
  getAdherence: (params) => websiteApi.get('/progress/adherence', { params }),

  // Plans
  getCurrentPlan: () => websiteApi.get('/plans/current'),
  getPlans: (params) => websiteApi.get('/plans', { params }),
  getPlanForWeek: (weekStart, create = false) => websiteApi.get('/plans/week', { params: { weekStart, create: create ? 'true' : 'false' } }),
  updatePlan: (id, data) => websiteApi.patch(`/plans/${id}`, data),
  deletePlan: (id) => websiteApi.delete(`/plans/${id}`),
  copyPlan: (id, targetWeekStart) => websiteApi.post(`/plans/${id}/copy`, { targetWeekStart }),
  savePlanTemplate: (id, templateName) => websiteApi.post(`/plans/${id}/template`, { templateName }),
  getPlanTemplates: () => websiteApi.get('/plans/templates'),
  applyTemplate: (data) => websiteApi.post('/plans/apply-template', data),
  duplicateDay: (id, data) => websiteApi.post(`/plans/${id}/duplicate-day`, data),

  // Sessions
  getTodaySession: () => websiteApi.get('/sessions/today'),
  getTodayBulkSession: () => websiteApi.get('/sessions/today/bulk'),
  getTodaySessionSummary: () => websiteApi.get('/sessions/today/summary'),
  prepareSession: (data) => websiteApi.post('/sessions/prepare', data),
  startSession: (data) => websiteApi.post('/sessions/start', data),
  logSession: (id, data) => websiteApi.patch(`/sessions/${id}/log`, data),
  // Always attach the client's local calendar day so streak math stays
  // timezone-resilient regardless of where the API server runs (L2B).
  finishSession: (id, data = {}) => websiteApi.patch(`/sessions/${id}/finish`, { localDate: toLocalDateString(new Date()), ...data }),
  getSession: (id) => websiteApi.get(`/sessions/${id}`),
  getSessionComparison: (id) => websiteApi.get(`/sessions/${id}/comparison`),
  duplicateSession: (id) => websiteApi.post(`/sessions/${id}/duplicate`),
  skipSession: (id) => websiteApi.delete(`/sessions/${id}`),
  getSessions: (params) => websiteApi.get('/sessions', { params }),

  // Exercises
  getMuscleGroups: () => websiteApi.get('/exercises/muscle-groups'),
  getExercises: (params) => websiteApi.get('/exercises', { params }),
  getAllExercises: async (params = {}) => {
    const all = [];
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const res = await websiteApi.get('/exercises', { params: { ...params, page, limit: 200 } });
      all.push(...(res.data || []));
      totalPages = res.meta?.totalPages || 1;
      page += 1;
    }
    return all;
  },

  // Progress
  getVolumeProgress: (params) => websiteApi.get('/progress/volume', { params }),
  getPRs: (params) => websiteApi.get('/progress/prs', { params }),

  // Check-in
  checkIn: (data = {}) => websiteApi.post('/checkins', { localDate: toLocalDateString(new Date()), ...data }),

  // Profile
  getProfile: () => websiteApi.get('/users/profile'),
  updateProfile: (data) => websiteApi.patch('/users/profile', data),

  // Badges
  getBadges: () => websiteApi.get('/badges'),

  // Progress photos — compress to WebP in-browser before the presigned S3 upload (L4D)
  getProgressPhotos: (params) => websiteApi.get('/photos', { params }),
  uploadProgressPhoto: async (file, { caption, takenAt } = {}) => {
    const compressed = await compressImage(file);
    const presign = await websiteApi.post('/photos/presigned', {
      fileName: compressed.name,
      mimeType: compressed.type,
    });
    const { uploadUrl, s3Key } = presign.data?.[0] || {};
    if (!uploadUrl || !s3Key) throw new Error('Could not prepare photo upload');

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': compressed.type },
      body: compressed,
    });
    if (!putRes.ok) throw new Error('Photo upload failed');

    return websiteApi.post('/photos', {
      s3Key,
      caption,
      takenAt: takenAt || new Date().toISOString(),
      fileSize: compressed.size,
      mimeType: compressed.type,
    });
  },

  // Export
  getExportThemes: () => websiteApi.get('/export/themes'),
  getRandomQuote: () => websiteApi.get('/quotes/random'),
  exportWorkoutSheet: async (params) => {
    if (params.format === 'pdf') {
      const res = await websiteApi.get('/export/workout-sheet', { params, responseType: 'blob' });
      downloadBlob(res, params.filename || 'gymweek-workout-sheet.pdf');
      return res;
    }
    return websiteApi.get('/export/workout-sheet', { params });
  },
  exportReport: async (params) => {
    if (params.format === 'pdf') {
      const res = await websiteApi.get('/export/report', { params, responseType: 'blob' });
      downloadBlob(res, params.filename || 'gymweek-report.pdf');
      return res;
    }
    return websiteApi.get('/export/report', { params });
  },
};
