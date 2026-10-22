import axiosInstance from './axiosInstance';

export const coursesApi = {
  // Read all courses (protectAny: Admin or Student)
  getAllCourses: async (params = {}) => {
    const response = await axiosInstance.get('/courses', { params });
    return response.data;
  },

  // Read course by ID (protectAny)
  getCourseById: async (id) => {
    const response = await axiosInstance.get(`/courses/${id}`);
    return response.data;
  },

  // Admin: Create Course
  createCourse: async (courseData) => {
    const payload = {
      ...courseData,
      youtubeLink: courseData.youtubeLink || courseData.youtube || undefined,
    };
    const response = await axiosInstance.post('/courses', payload);
    return response.data;
  },

  // Admin: Update Course Details
  updateCourse: async (id, courseData) => {
    const payload = { ...courseData };
    if (courseData.youtubeLink !== undefined || courseData.youtube !== undefined) {
      payload.youtubeLink = courseData.youtubeLink || courseData.youtube || null;
    }
    const response = await axiosInstance.patch(`/courses/${id}`, payload);
    return response.data;
  },

  // Admin: Update Course Status
  updateCourseStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/courses/${id}/status`, { status });
    return response.data;
  },

  // Admin: Map Study Materials to Course
  mapStudyMaterials: async (id, studyMaterialIds) => {
    const response = await axiosInstance.put(`/courses/${id}/study-materials`, { studyMaterialIds });
    return response.data;
  },

  // Admin: Map Examinations to Course
  mapExaminations: async (id, examinationIds) => {
    const response = await axiosInstance.put(`/courses/${id}/examinations`, { examinationIds });
    return response.data;
  },

  // Admin: Delete Course
  deleteCourse: async (id) => {
    const response = await axiosInstance.delete(`/courses/${id}`);
    return response.data;
  },
};
