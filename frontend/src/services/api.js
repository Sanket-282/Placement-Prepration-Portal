import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Handle responses
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

// Coding Questions API
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
  addCompany: (data) => api.post('/companies', data),
  deleteCompany: (name) => api.delete(`/companies/${name}`)
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
  getStats: () => api.get('/user/stats')
};

// Leaderboard API
export const leaderboardAPI = {
  getAll: (params) => api.get('/leaderboard', { params }),
  getMyRank: () => api.get('/leaderboard/my-rank'),
  getWeekly: () => api.get('/leaderboard/weekly')
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getSubmissions: (params) => api.get('/admin/submissions', { params })
};

export default api;

