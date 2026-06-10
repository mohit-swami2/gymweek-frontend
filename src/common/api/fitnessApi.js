import { websiteApi } from './client.js';

export const fitnessApi = {
  // Dashboard
  getSummary: () => websiteApi.get('/progress/summary'),
  getStats: () => websiteApi.get('/users/stats'),
  getStreak: () => websiteApi.get('/checkins/streak'),

  // Plans
  getCurrentPlan: () => websiteApi.get('/plans/current'),
  updatePlan: (id, data) => websiteApi.patch(`/plans/${id}`, data),

  // Sessions
  getTodaySession: () => websiteApi.get('/sessions/today'),
  startSession: (data) => websiteApi.post('/sessions/start', data),
  logSession: (id, data) => websiteApi.patch(`/sessions/${id}/log`, data),
  finishSession: (id, data) => websiteApi.patch(`/sessions/${id}/finish`, data),
  getSessions: (params) => websiteApi.get('/sessions', { params }),

  // Exercises
  getMuscleGroups: () => websiteApi.get('/exercises/muscle-groups'),
  getExercises: (params) => websiteApi.get('/exercises', { params }),

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
