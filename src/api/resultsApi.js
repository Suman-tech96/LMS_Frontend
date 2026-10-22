import axiosInstance from './axiosInstance';

export const resultsApi = {
  // Student: Get all published results for current logged-in student
  getStudentPublishedResults: async () => {
    const response = await axiosInstance.get('/student/results');
    return response.data;
  },

  // Student: Get single published result details
  getStudentPublishedResultById: async (id) => {
    const response = await axiosInstance.get(`/student/results/${id}`);
    return response.data;
  },

  // Admin: Get all results across the platform
  getAllResults: async (params = {}) => {
    const response = await axiosInstance.get('/results', { params });
    return response.data;
  },

  // Admin: Get single result by ID
  getResultById: async (id) => {
    const response = await axiosInstance.get(`/results/${id}`);
    return response.data;
  },

  // Admin: Publish result
  publishResult: async (id) => {
    const response = await axiosInstance.post(`/results/${id}/publish`);
    return response.data;
  },

  // Admin: Unpublish result
  unpublishResult: async (id) => {
    const response = await axiosInstance.post(`/results/${id}/unpublish`);
    return response.data;
  },
};
