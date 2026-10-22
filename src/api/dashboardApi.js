import axiosInstance from './axiosInstance';

export const dashboardApi = {
  // Admin: Get dashboard overview summary statistics
  getOverview: async () => {
    const response = await axiosInstance.get('/dashboard/overview');
    return response.data;
  },

  // Admin: Get study material statistics
  getStudyMaterials: async () => {
    const response = await axiosInstance.get('/dashboard/study-materials');
    return response.data;
  },

  // Admin: Get course statistics
  getCourses: async () => {
    const response = await axiosInstance.get('/dashboard/courses');
    return response.data;
  },

  // Admin: Get examination summary
  getExaminations: async () => {
    const response = await axiosInstance.get('/dashboard/examinations');
    return response.data;
  },

  // Admin: Get examination status breakdown
  getExaminationsStatus: async () => {
    const response = await axiosInstance.get('/dashboard/examinations/status');
    return response.data;
  },

  // Admin: Get detailed examination statistics
  getExaminationStatistics: async () => {
    const response = await axiosInstance.get('/dashboard/examination-statistics');
    return response.data;
  },

  // Admin: Get results status breakdown
  getResultsStatus: async () => {
    const response = await axiosInstance.get('/dashboard/results/status');
    return response.data;
  },
};
