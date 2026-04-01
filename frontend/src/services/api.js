import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return '/api';
  return value.replace(/\/+$/, '');
};

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL) || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const API = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export const getUsers = () => axios.get(`${API}/users`);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetOTP: (data) => api.post('/auth/verify-reset-otp', data)
};

// Questions API
export const questionsAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getOne: (id) => api.get(`/questions/${id}`),
  getRandom: (params) => api.get('/questions/random', { params }),
  getCategories: () => api.get('/questions/categories'),
  submitAnswer: (id, data) => api.post(`/questions/${id}/submit`, data),
  addQuestion: (data) => api.post('/questions', data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`)
};

// Coding API
export const codingAPI = {
  getAll: (params) => api.get('/coding-questions', { params }),
  getOne: (id) => api.get(`/coding-questions/${id}`),
  getDaily: () => api.get('/coding-questions/daily'),
  runCode: (data) => api.post('/coding-questions/run', data),
  submitCode: (data) => api.post('/coding-questions/submit', data),
  addQuestion: (data) => api.post('/coding-questions', data),
  updateQuestion: (id, data) => api.put(`/coding-questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/coding-questions/${id}`)
};

// Companies API
export const companiesAPI = {
  getAll: () => api.get('/companies'),
  getOne: (name) => api.get(`/companies/${name}`),
  getById: (id) => api.get(`/companies/id/${id}`),
  addCompany: (data) => api.post('/companies', data),
  deleteCompany: (name) => api.delete(`/companies/${name}`),
  addQuestion: (companyId, data) => api.post(`/companies/${companyId}/questions`, data),
  updateQuestion: (companyId, questionId, data) => api.put(`/companies/${companyId}/questions/${questionId}`, data),
  deleteQuestion: (companyId, questionId) => api.delete(`/companies/${companyId}/questions/${questionId}`)
};

// Aptitude API
export const aptitudeAPI = {
  getCategories: () => api.get('/aptitude/categories'),
  getTopics: (params) => api.get('/aptitude/topics', { params }),
  getTopicsWithCounts: (params) => api.get('/aptitude/topics-with-counts', { params }),
  getQuestions: (params) => api.get('/aptitude/questions', { params })
};

// Admin Aptitude API
export const adminAptitudeAPI = {
  getQuestions: (params) => api.get('/aptitude/admin/questions', { params }),
  addQuestion: (data) => api.post('/aptitude/admin/question', data),
  updateQuestion: (id, data) => api.put(`/aptitude/admin/question/${id}`, data),
  deleteQuestion: (id) => api.delete(`/aptitude/admin/question/${id}`)
};

// Mock Tests API
export const mockTestsAPI = {
  getAll: (params) => api.get('/mock-tests', { params }),
  getOne: (id) => api.get(`/mock-tests/${id}`),
  startTest: (id) => api.post(`/mock-tests/${id}/start`),
  submitTest: (id, data) => api.post(`/mock-tests/${id}/submit`, data),
  createTest: (data) => api.post('/mock-tests', data),
  updateTest: (id, data) => api.put(`/mock-tests/${id}`, data),
  deleteTest: (id) => api.delete(`/mock-tests/${id}`)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getBookmarks: () => api.get('/user/bookmarks'),
  addBookmark: (data) => api.post('/user/bookmarks', data),
  removeBookmark: (data) => api.delete('/user/bookmarks', { data }),
  getSubmissions: (params) => api.get('/user/submissions', { params }),
  getStats: () => api.get('/user/stats'),
  uploadProfileImage: (formData) => api.post('/user/profile/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export const resumeAPI = {
  upsert: (data) => api.post('/resume', data),
  getByUserId: (userId) => api.get(`/resume/${userId}`),
  updateById: (id, data) => api.put(`/resume/${id}`, data)
};

// Leaderboard API
export const leaderboardAPI = {
  getAll: (params) => api.get('/leaderboard', { params }),
  getMyRank: () => api.get('/leaderboard/my-rank'),
  getWeekly: () => api.get('/leaderboard/weekly')
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  blockUser: (id) => api.post(`/admin/users/${id}/block`),
  unblockUser: (id) => api.post(`/admin/users/${id}/unblock`),
  promoteUser: (id, role) => api.post(`/admin/users/${id}/promote`, { role }),
  resetUserProgress: (id) => api.post(`/admin/users/${id}/reset`),
  getQuestions: (params) => api.get('/admin/questions', { params }),
  addQuestion: (data) => api.post('/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  bulkAddQuestions: (data) => api.post('/admin/questions/bulk', data),
  getCodingQuestions: (params) => api.get('/admin/coding-questions', { params }),
  addCodingQuestion: (data) => api.post('/admin/coding-questions', data),
  updateCodingQuestion: (id, data) => api.put(`/admin/coding-questions/${id}`, data),
  deleteCodingQuestion: (id) => api.delete(`/admin/coding-questions/${id}`),
  toggleDailyActive: (id) => api.patch(`/admin/coding-questions/${id}/set-daily`),
  getCompanyQuestions: (params) => api.get('/admin/company-questions', { params }),
  addCompany: (data) => api.post('/admin/company-questions', data),
  updateCompany: (id, data) => api.put(`/admin/company-questions/${id}`, data),
  deleteCompany: (id) => api.delete(`/admin/company-questions/${id}`),
  getMockTests: (params) => api.get('/admin/mock-tests', { params }),
  addMockTest: (data) => api.post('/admin/mock-tests', data),
  updateMockTest: (id, data) => api.put(`/admin/mock-tests/${id}`, data),
  deleteMockTest: (id) => api.delete(`/admin/mock-tests/${id}`),
  toggleMockTest: (id) => api.post(`/admin/mock-tests/${id}/toggle`),
  getTestSubmissions: (testId) => api.get(`/mock-tests/${testId}/submissions`),
  getLeaderboard: (params) => api.get('/admin/leaderboard', { params }),
  resetLeaderboard: () => api.post('/admin/leaderboard/reset'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getSubmissions: (params) => api.get('/admin/submissions', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data)
};

export default api;
