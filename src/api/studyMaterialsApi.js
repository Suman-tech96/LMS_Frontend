import axiosInstance from './axiosInstance';

export const studyMaterialsApi = {
  // Read all study materials (protectAny: Admin or Student)
  getAllStudyMaterials: async (params = {}) => {
    const response = await axiosInstance.get('/study-materials', { params });
    return response.data;
  },

  // Read study material by ID (protectAny)
  getStudyMaterialById: async (id) => {
    const response = await axiosInstance.get(`/study-materials/${id}`);
    return response.data;
  },

  // Admin: Upload/Create Study Material (supports FormData with multiple files or JSON payload)
  createStudyMaterial: async (data) => {
    const response = await axiosInstance.post('/study-materials', data);
    return response.data;
  },

  // Admin: Update Study Material details (supports FormData with additional files or JSON payload)
  updateStudyMaterial: async (id, data) => {
    const response = await axiosInstance.patch(`/study-materials/${id}`, data);
    return response.data;
  },

  // Admin: Delete a particular file from study material
  deleteStudyMaterialFile: async (id, fileId) => {
    const response = await axiosInstance.delete(`/study-materials/${id}/files/${fileId}`);
    return response.data;
  },

  // Admin: Update status
  updateStudyMaterialStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/study-materials/${id}/status`, { status });
    return response.data;
  },

  // Admin: Delete study material
  deleteStudyMaterial: async (id) => {
    const response = await axiosInstance.delete(`/study-materials/${id}`);
    return response.data;
  },

  // Helper to ensure accessible URL for local uploads or external URLs
  resolveFileUrl: (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendBase}${cleanPath}`;
  }
};
