import { websiteApi } from './client.js';

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
  finishSession: (id, data) => websiteApi.patch(`/sessions/${id}/finish`, data),
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
  checkIn: (data) => websiteApi.post('/checkins', data),

  // Profile
  getProfile: () => websiteApi.get('/users/profile'),
  updateProfile: (data) => websiteApi.patch('/users/profile', data),

  // Badges
  getBadges: () => websiteApi.get('/badges'),

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
