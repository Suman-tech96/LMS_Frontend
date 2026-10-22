import axiosInstance from './axiosInstance';

export const authApi = {
  // Admin Login: POST /auth/login
  adminLogin: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  // Student Registration: POST /auth/student/register
  studentRegister: async (studentData) => {
    const response = await axiosInstance.post('/auth/student/register', studentData);
    return response.data;
  },

  // Student Login: POST /auth/student/login
  studentLogin: async (credentials) => {
    const response = await axiosInstance.post('/auth/student/login', credentials);
    return response.data;
  },

  // Forgot Password: POST /auth/forgot-password
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset Password using 6-digit OTP: POST /auth/reset-password
  resetPassword: async ({ email, otp, password }) => {
    const cleanOtp = otp ? String(otp).trim() : '';
    const response = await axiosInstance.post('/auth/reset-password', {
      email: email ? email.trim() : undefined,
      otp: cleanOtp,
      code: cleanOtp,
      token: cleanOtp,
      password,
    });
    return response.data;
  },

  // Get Current Logged-in User Profile: GET /auth/me
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
