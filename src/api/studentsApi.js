import axiosInstance from './axiosInstance';

export const studentsApi = {
  // Admin: Get all students
  getAllStudents: async (params = {}) => {
    const response = await axiosInstance.get('/students', { params });
    return response.data;
  },

  // Admin: Get student by ID
  getStudentById: async (id) => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },

  // Admin: Create new student
  createStudent: async (data) => {
    const response = await axiosInstance.post('/students', data);
    return response.data;
  },

  // Admin: Update student details
  updateStudent: async (id, data) => {
    const response = await axiosInstance.patch(`/students/${id}`, data);
    return response.data;
  },

  // Admin: Update student status
  updateStudentStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/students/${id}/status`, { status });
    return response.data;
  },

  // Admin: Update student course and batch
  updateStudentCourseBatch: async (id, courseId, batch) => {
    const response = await axiosInstance.patch(`/students/${id}/course-batch`, { courseId, batch });
    return response.data;
  },

  // Admin: Get examination history for a specific student
  getStudentExaminations: async (id) => {
    const response = await axiosInstance.get(`/students/${id}/examinations`);
    return response.data;
  },

  // Admin: Get result records for a specific student
  getStudentResults: async (id) => {
    const response = await axiosInstance.get(`/students/${id}/results`);
    return response.data;
  },

  // Admin: Soft-delete student
  deleteStudent: async (id) => {
    const response = await axiosInstance.delete(`/students/${id}`);
    return response.data;
  },
};
