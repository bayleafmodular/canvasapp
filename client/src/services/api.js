import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const verifyLoginTwoFactor = (data) => api.post('/auth/verify-login-2fa', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const oauthLogin = (data) => api.post('/auth/oauth-login', data);
export const linkGoogleAccount = (data) => api.post('/auth/link-google', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.patch('/auth/profile', data);
export const updatePassword = (data) => api.patch('/auth/password', data);
export const updateTwoFactor = (enabled) => api.patch('/auth/2fa', { enabled });
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const resendOtp = (data) => api.post('/auth/resend-otp', data);
export const getAdminStats = () => api.get('/admin/dashboard-stats');
export const getAdminUsers = () => api.get('/admin/users');
export const createAdminUser = (data) => api.post('/admin/users', data);
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getStaffUsers = () => api.get('/admin/staff');
export const createStaffUser = (data) => api.post('/admin/staff', data);
export const updateStaffUser = (id, data) => api.patch(`/admin/staff/${id}`, data);
export const getDrawings = () => api.get('/drawings');
export const createDrawing = (data) => api.post('/drawings', data);
export const getDrawing = (id) => api.get(`/drawings/${id}`);
export const deleteDrawing = (id) => api.delete(`/drawings/${id}`);
export const getPricingSettings = () => api.get('/pricing');
export const updatePricingSettings = (data) => api.patch('/pricing', data);

// Orders APIs
export const createOrder = (data) => api.post('/orders', data);
export const getAdminOrders = () => api.get('/admin/orders');
export const updateAdminOrderStatus = (id, status, remarks) => api.patch(`/admin/orders/${id}`, { status, remarks });
export const getUserOrders = () => api.get('/orders');
