import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If data is FormData, allow Axios/browser to set boundary header automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error unwrapping
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is 401 and user was logged in (skip if attempting login)
    const isLoginEndpoint = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      const currentToken = localStorage.getItem('lms_token');
      if (currentToken) {
        // Token expired or invalid
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        // Dispatch custom event so app can update without full page refresh
        window.dispatchEvent(new Event('lms_auth_expired'));
      }
    }

    // Format validation errors from express-validator if present
    let message = error.response?.data?.message;
    if (Array.isArray(error.response?.data?.errors) && error.response.data.errors.length > 0) {
      message = error.response.data.errors.map((e) => e.message).join('. ');
    } else if (!message) {
      message =
        error.response?.data?.error ||
        error.message ||
        'An unexpected server error occurred. Please try again.';
    }

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default axiosInstance;
