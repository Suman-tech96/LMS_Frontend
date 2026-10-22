import axiosInstance from './axiosInstance';

export const examinationsApi = {
  // ================= STUDENT EXAM ENDPOINTS =================
  // Get all exams available to authenticated student
  getStudentAvailableExams: async () => {
    const response = await axiosInstance.get('/student/examinations');
    return response.data;
  },

  // Get instructions & eligibility details for an exam
  getStudentExamInstructions: async (id) => {
    const response = await axiosInstance.get(`/student/examinations/${id}/instructions`);
    return response.data;
  },

  // Get exam details & questions for active test
  getStudentExamById: async (id) => {
    const response = await axiosInstance.get(`/student/examinations/${id}`);
    return response.data;
  },

  // Start a new exam attempt or resume an active one
  startExamAttempt: async (id) => {
    const response = await axiosInstance.post(`/student/examinations/${id}/start`);
    return response.data;
  },

  // Auto-save student single question answer
  saveStudentAnswer: async (id, payload) => {
    const response = await axiosInstance.post(`/student/examinations/${id}/save-answer`, payload);
    return response.data;
  },

  // Submit complete exam attempt
  submitExamAttempt: async (id, payload) => {
    const response = await axiosInstance.post(`/student/examinations/${id}/submit`, payload);
    return response.data;
  },

  // Get current / active attempt with remaining time
  getStudentCurrentAttempt: async (id) => {
    const response = await axiosInstance.get(`/student/examinations/${id}/attempt`);
    return response.data;
  },

  // Get student specific exam result
  getStudentExamResult: async (id) => {
    const response = await axiosInstance.get(`/student/examinations/${id}/result`);
    return response.data;
  },

  // ================= ADMIN EXAM ENDPOINTS =================
  getAllExaminations: async (params = {}) => {
    const response = await axiosInstance.get('/examinations', { params });
    return response.data;
  },

  getExaminationById: async (id) => {
    const response = await axiosInstance.get(`/examinations/${id}`);
    return response.data;
  },

  createExamination: async (data) => {
    const response = await axiosInstance.post('/examinations', data);
    return response.data;
  },

  updateExamination: async (id, data) => {
    const response = await axiosInstance.patch(`/examinations/${id}`, data);
    return response.data;
  },

  updateExaminationStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/examinations/${id}/status`, { status });
    return response.data;
  },

  deleteExamination: async (id) => {
    const response = await axiosInstance.delete(`/examinations/${id}`);
    return response.data;
  },

  // Question bank management
  addExamQuestion: async (id, questionData) => {
    const response = await axiosInstance.post(`/examinations/${id}/questions`, questionData);
    return response.data;
  },

  updateExamQuestion: async (id, questionId, questionData) => {
    const response = await axiosInstance.patch(`/examinations/${id}/questions/${questionId}`, questionData);
    return response.data;
  },

  deleteExamQuestion: async (id, questionId) => {
    const response = await axiosInstance.delete(`/examinations/${id}/questions/${questionId}`);
    return response.data;
  },

  toggleQuestionStatus: async (id, questionId, isActive) => {
    const response = await axiosInstance.patch(`/examinations/${id}/questions/${questionId}/status`, { isActive });
    return response.data;
  },
};
