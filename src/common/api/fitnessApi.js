import { websiteApi } from './client.js';

export const fitnessApi = {
  // Dashboard
  getSummary: () => websiteApi.get('/progress/summary'),
  getStats: () => websiteApi.get('/users/stats'),
  getStreak: () => websiteApi.get('/checkins/streak'),

  // Plans
  getCurrentPlan: () => websiteApi.get('/plans/current'),
  getPlans: (params) => websiteApi.get('/plans', { params }),
  getPlanForWeek: (weekStart, create = false) => websiteApi.get('/plans/week', { params: { weekStart, create: create ? 'true' : 'false' } }),
  updatePlan: (id, data) => websiteApi.patch(`/plans/${id}`, data),
  deletePlan: (id) => websiteApi.delete(`/plans/${id}`),

  // Sessions
  getTodaySession: () => websiteApi.get('/sessions/today'),
  getTodaySessionSummary: () => websiteApi.get('/sessions/today/summary'),
  startSession: (data) => websiteApi.post('/sessions/start', data),
  logSession: (id, data) => websiteApi.patch(`/sessions/${id}/log`, data),
  finishSession: (id, data) => websiteApi.patch(`/sessions/${id}/finish`, data),
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
};
