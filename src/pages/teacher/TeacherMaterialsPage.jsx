import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/useAuth';
import { studyMaterialsApi } from '../../api/studyMaterialsApi';
import { coursesApi } from '../../api/coursesApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  FileText,
  Upload,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Lock,
  Trash2,
  Eye,
  Edit3,
  Search,
  RefreshCw,
  Power,
  Video,
  X,
  Download,
  Paperclip,
} from 'lucide-react';

// YouTube Brand Logo Icon component
const YoutubeIcon = ({ size = 18, style = {}, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      fill="#FF0000"
    />
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
  </svg>
);

export const TeacherMaterialsPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  // --- Study Materials List & Pagination ---
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // --- Filter & Sorting States ---
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');

  // --- Modal: Step 1 (Create Study Material with Multiple Files & Videos) ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    course: '',
    category: 'Technical',
    status: 'active',
    youtubeLinks: [],
  });
  const [uploadYoutubeInput, setUploadYoutubeInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const uploadFileInputRef = useRef(null);

  // --- Modal: Step 3 (Get Study Material by ID) ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaterialDetail, setSelectedMaterialDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // --- Modal: Step 4 (Update Study Material, Attached Files & Videos) ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    course: '',
    category: '',
    youtubeLinks: [],
    status: 'active',
  });
  const [editYoutubeInput, setEditYoutubeInput] = useState('');
  const [editFilesToAdd, setEditFilesToAdd] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingFileId, setDeletingFileId] = useState(null);
  const editFileInputRef = useRef(null);

  // --- Modal: Step 5 (Update Study Material Status) ---
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetMaterialForStatus, setTargetMaterialForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // --- Modal: Step 6 (Delete Study Material) ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Flash message notification
  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  // Helper for file type badge
  const getFileTypeBadgeVariant = (type) => {
    switch (type) {
      case 'pdf':
        return 'danger';
      case 'image':
        return 'success';
      case 'video':
        return 'warning';
      case 'document':
        return 'info';
      default:
        return 'neutral';
    }
  };

  // Load active courses for dropdown selections
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await coursesApi.getAllCourses({ limit: 100, status: 'active' });
        if (res.data) setCourses(res.data);
      } catch (err) {
        console.warn('Could not load courses for materials:', err.message);
      }
    };
    loadCourses();
  }, []);

  // Fetch Study Materials with all query parameters
  const fetchMaterials = useCallback(async (pageOverride) => {
    setLoading(true);
    setError(null);
    try {
      const activePage = pageOverride !== undefined ? pageOverride : pagination.page;
      const params = {
        page: activePage,
        limit: pagination.limit,
        sort: sortOption,
      };

      if (search.trim()) params.search = search.trim();
      if (courseFilter) params.course = courseFilter;
      if (categoryFilter.trim()) params.category = categoryFilter.trim();
      if (fileTypeFilter) params.fileType = fileTypeFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await studyMaterialsApi.getAllStudyMaterials(params);
      if (res.success) {
        setMaterials(res.data || []);
        if (res.pagination) {
          setPagination({
            page: res.pagination.page,
            limit: res.pagination.limit,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages,
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve study materials.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortOption, search, courseFilter, categoryFilter, fileTypeFilter, statusFilter]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Filter Form Submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchMaterials(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCourseFilter('');
    setCategoryFilter('');
    setFileTypeFilter('');
    setStatusFilter('');
    setSortOption('-createdAt');
    fetchMaterials(1);
  };

  // ----------------------------------------------------
  // Step 1: Create Study Material Handlers
  // ----------------------------------------------------
  const handleOpenUploadModal = () => {
    setUploadData({
      title: '',
      description: '',
      course: courses[0]?._id || '',
      category: 'Technical',
      status: 'active',
      youtubeLinks: [],
    });
    setUploadYoutubeInput('');
    setSelectedFiles([]);
    setUploadError('');
    setShowUploadModal(true);
  };

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Add YouTube Link in Upload Modal
  const handleAddUploadYoutube = (e) => {
    e?.preventDefault?.();
    const val = uploadYoutubeInput.trim();
    if (!val) return;
    if (uploadData.youtubeLinks.includes(val)) {
      setUploadError('This YouTube link has already been added.');
      return;
    }
    setUploadData((prev) => ({
      ...prev,
      youtubeLinks: [...prev.youtubeLinks, val]
    }));
    setUploadYoutubeInput('');
    setUploadError('');
  };

  const handleRemoveUploadYoutube = (index) => {
    setUploadData((prev) => ({
      ...prev,
      youtubeLinks: prev.youtubeLinks.filter((_, i) => i !== index)
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadError('');

    try {
      if (!uploadData.title.trim()) {
        throw new Error('Study material title is required.');
      }
      if (!uploadData.course) {
        throw new Error('Please select an associated course.');
      }

      // If user typed a YouTube URL but forgot to hit the '+' button, include it automatically!
      let finalYoutubeLinks = [...uploadData.youtubeLinks];
      if (uploadYoutubeInput.trim() && !finalYoutubeLinks.includes(uploadYoutubeInput.trim())) {
        finalYoutubeLinks.push(uploadYoutubeInput.trim());
      }

      if (selectedFiles.length === 0 && finalYoutubeLinks.length === 0) {
        throw new Error('Please upload at least one file or add at least one YouTube video link.');
      }

      const formData = new FormData();
      formData.append('title', uploadData.title.trim());
      formData.append('course', uploadData.course);
      if (uploadData.description.trim()) formData.append('description', uploadData.description.trim());
      if (uploadData.category.trim()) formData.append('category', uploadData.category.trim());
      formData.append('status', uploadData.status);

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Append YouTube links
      finalYoutubeLinks.forEach((link) => {
        formData.append('youtubeLinks', link);
      });
      if (finalYoutubeLinks[0]) {
        formData.append('youtubeLink', finalYoutubeLinks[0]);
      }

      const res = await studyMaterialsApi.createStudyMaterial(formData);
      if (res.success) {
        setShowUploadModal(false);
        setSelectedFiles([]);
        setUploadYoutubeInput('');
        triggerSuccess(`Study material '${uploadData.title}' saved successfully!`);
        fetchMaterials(1);
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to create study material.');
    } finally {
      setUploadLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 3: View Details Handlers (Opens Data Specifications Modal)
  // ----------------------------------------------------
  const handleViewDetails = async (target) => {
    const item = typeof target === 'object' && target ? target : materials.find((m) => m._id === target);
    if (item) {
      setSelectedMaterialDetail(item);
    }
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const id = typeof target === 'object' && target ? target._id : target;
      const res = await studyMaterialsApi.getStudyMaterialById(id);
      if (res.success && res.data) {
        setSelectedMaterialDetail(res.data);
      }
    } catch (err) {
      console.error('Could not fetch study material details:', err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 4: Edit Material & Manage Files & Videos
  // ----------------------------------------------------
  const handleOpenEditModal = (item) => {
    setEditingMaterial(item);
    const existingLinks = item.youtubeLinks && item.youtubeLinks.length > 0
      ? item.youtubeLinks
      : (item.youtubeLink ? [item.youtubeLink] : []);

    setEditData({
      title: item.title || '',
      description: item.description || '',
      course: item.course?._id || item.course || '',
      category: item.category || 'Technical',
      youtubeLinks: existingLinks,
      status: item.status || 'active',
    });
    setEditYoutubeInput('');
    setEditFilesToAdd([]);
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setEditFilesToAdd((prev) => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const handleRemoveEditFileToAdd = (index) => {
    setEditFilesToAdd((prev) => prev.filter((_, i) => i !== index));
  };

  // Add YouTube Link in Edit Modal
  const handleAddEditYoutube = (e) => {
    e?.preventDefault?.();
    const val = editYoutubeInput.trim();
    if (!val) return;
    if (editData.youtubeLinks.includes(val)) {
      setEditError('This YouTube link has already been added.');
      return;
    }
    setEditData((prev) => ({
      ...prev,
      youtubeLinks: [...prev.youtubeLinks, val]
    }));
    setEditYoutubeInput('');
    setEditError('');
  };

  const handleRemoveEditYoutube = (index) => {
    setEditData((prev) => ({
      ...prev,
      youtubeLinks: prev.youtubeLinks.filter((_, i) => i !== index)
    }));
  };

  // Delete an individual existing file from the material
  const handleDeleteExistingFile = async (fileId) => {
    if (!editingMaterial) return;
    try {
      setDeletingFileId(fileId);
      const res = await studyMaterialsApi.deleteStudyMaterialFile(editingMaterial._id, fileId);
      if (res.success && res.data) {
        setEditingMaterial(res.data);
        triggerSuccess('File removed successfully from study material.');
        fetchMaterials();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to remove file.');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMaterial) return;
    setEditLoading(true);
    setEditError('');

    try {
      let finalYoutubeLinks = [...editData.youtubeLinks];
      if (editYoutubeInput.trim() && !finalYoutubeLinks.includes(editYoutubeInput.trim())) {
        finalYoutubeLinks.push(editYoutubeInput.trim());
      }

      const formData = new FormData();
      formData.append('title', editData.title.trim());
      formData.append('description', editData.description.trim());
      formData.append('category', editData.category.trim());
      formData.append('status', editData.status);
      if (editData.course) formData.append('course', editData.course);

      // Append newly added files
      if (editFilesToAdd.length > 0) {
        editFilesToAdd.forEach((file) => {
          formData.append('files', file);
        });
      }

      // Append YouTube links
      finalYoutubeLinks.forEach((link) => {
        formData.append('youtubeLinks', link);
      });
      formData.append('youtubeLink', finalYoutubeLinks[0] || '');

      const res = await studyMaterialsApi.updateStudyMaterial(editingMaterial._id, formData);
      if (res.success) {
        setShowEditModal(false);
        setEditFilesToAdd([]);
        setEditYoutubeInput('');
        triggerSuccess(`Study material '${editData.title}' updated successfully!`);
        fetchMaterials();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update study material.');
    } finally {
      setEditLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 5: Update Study Material Status Handler
  // ----------------------------------------------------
  const handleOpenStatusModal = (item) => {
    setTargetMaterialForStatus(item);
    setSelectedStatus(item.status || 'active');
    setStatusError('');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetMaterialForStatus) return;
    setStatusLoading(true);
    setStatusError('');

    try {
      const res = await studyMaterialsApi.updateStudyMaterialStatus(
        targetMaterialForStatus._id,
        selectedStatus
      );
      if (res.success) {
        setShowStatusModal(false);
        triggerSuccess(res.message || `Study material status updated to '${selectedStatus}'.`);
        fetchMaterials();
      }
    } catch (err) {
      setStatusError(err.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 6: Delete Study Material Handler (Soft Delete)
  // ----------------------------------------------------
  const handleOpenDeleteModal = (item) => {
    setMaterialToDelete(item);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!materialToDelete) return;
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await studyMaterialsApi.deleteStudyMaterial(materialToDelete._id);
      if (res.success) {
        setShowDeleteModal(false);
        triggerSuccess(`Study material '${materialToDelete.title}' deleted successfully.`);
        fetchMaterials();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete study material.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem', fontWeight: 800 }}>Study Materials Management</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Upload multiple files, attach video lectures, and publish course curricula.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchMaterials()}
            title="Refresh list"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          {isAdmin ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenUploadModal}
            >
              <Upload size={16} />
              <span>Upload Material</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              disabled
              title="Admin authentication required to upload materials"
            >
              <Lock size={15} />
              <span>Upload (Admin Only)</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {/* Search Input */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Search (Title, Description, Category)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Node.js Backend..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Course Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Filter by Course</label>
              <select
                className="form-input"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Technical, Theory..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>

            {/* File Type Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>File Type</label>
              <select
                className="form-input"
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
              >
                <option value="">All Formats</option>
                <option value="pdf">PDF Documents</option>
                <option value="image">Images</option>
                <option value="document">Office Docs</option>
                <option value="video">Videos</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Status</label>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort Option */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Sort By</label>
              <select
                className="form-input"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
                <option value="-fileSize">File Size (Largest)</option>
                <option value="fileSize">File Size (Smallest)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-primary">
              <Search size={15} />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Study Materials Table */}
      {loading ? (
        <LoadingSpinner fullPage text="Retrieving study materials from repository..." />
      ) : materials.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title & Description</th>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Files & Resources</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const isYt = (url) => typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'));
                  const realFiles = (m.files || []).filter(
                    (f) => f && f.fileUrl && !isYt(f.fileUrl) && !(f.fileType === 'video' && (f.fileName || '').toLowerCase().includes('youtube'))
                  );
                  const isLegacySingleFile = (!m.files || m.files.length === 0) && m.fileUrl && !isYt(m.fileUrl) && m.fileType !== 'video';
                  const filesCount = realFiles.length + (isLegacySingleFile ? 1 : 0);
                  const youtubeCount = m.youtubeLinks?.length || (m.youtubeLink ? 1 : 0);
                  const totalBytes = realFiles.length > 0
                    ? realFiles.reduce((acc, f) => acc + (f.fileSize || 0), 0)
                    : (isLegacySingleFile ? (m.fileSize || 0) : 0);

                  return (
                    <tr key={m._id}>
                      <td>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{m.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {m.description || 'Verified course study material'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>{m.course?.name || m.course?.code || 'General'}</span>
                          {m.course?.code && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Code: {m.course.code}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge variant="info">{m.category || 'General'}</Badge>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {filesCount > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Paperclip size={14} color="var(--primary)" />
                              <span style={{ fontWeight: 600 }}>
                                {filesCount} {filesCount === 1 ? 'File' : 'Files'}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                ({formatFileSize(totalBytes)})
                              </span>
                            </div>
                          )}
                          {youtubeCount > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <YoutubeIcon size={15} />
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {youtubeCount} {youtubeCount === 1 ? 'Video Lecture' : 'Video Lectures'}
                              </span>
                            </div>
                          )}
                          {filesCount === 0 && youtubeCount === 0 && (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No Resources</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge variant={m.status === 'active' ? 'success' : 'neutral'}>
                          {m.status || 'Active'}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {/* Preview / View Details (Displays Study Material Data in Modal, Not External Link) */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewDetails(m)}
                            title="View Material Details & Specifications"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit Details, Files, Videos & Status */}
                          {isAdmin && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEditModal(m)}
                              title="Edit Material"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}

                          {/* Delete */}
                          {isAdmin && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => handleOpenDeleteModal(m)}
                              title="Delete Study Material"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total study materials)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchMaterials(pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchMaterials(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No study materials found"
          description={search || courseFilter || categoryFilter || fileTypeFilter || statusFilter ? "No materials matched your filters. Try clearing some search parameters." : "No documents uploaded yet. Click 'Upload Material' to publish lecture notes."}
          action={
            isAdmin && (
              <button className="btn btn-primary" onClick={handleOpenUploadModal}>
                <Plus size={16} />
                <span>Upload Material</span>
              </button>
            )
          }
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Create Study Material (Upload Multiple Files with '+' Button)    */}
      {/* ========================================================================= */}
      {showUploadModal && isAdmin && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => !uploadLoading && setShowUploadModal(false)}
          title="Create Study Material & Upload Resources"
          maxWidth="680px"
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {uploadError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            <div>
              <label className="form-label">Material Title *</label>
              <input
                type="text"
                required
                maxLength={200}
                className="form-input"
                placeholder="e.g. Unit 3: Distributed Systems Architecture"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="Summary of lecture notes, key takeaways, syllabus reference..."
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Associated Course *</label>
                <select
                  required
                  className="form-input"
                  value={uploadData.course}
                  onChange={(e) => setUploadData({ ...uploadData, course: e.target.value })}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Technical, Theory, Notes"
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={uploadData.status}
                  onChange={(e) => setUploadData({ ...uploadData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* MULTI-FILE UPLOAD SECTION WITH '+' ICON */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                    Study Material Files ({selectedFiles.length})
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Upload one or more files (PDFs, Images, Word, PPT, ZIP). URLs are generated automatically.
                  </span>
                </div>

                <input
                  type="file"
                  ref={uploadFileInputRef}
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFilesSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.txt,.zip"
                />

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => uploadFileInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={16} />
                  <span>Add Files</span>
                </button>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                        <FileText size={18} color="var(--primary)" />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {file.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => uploadFileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.4rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-secondary)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)'
                      }}
                    >
                      <Plus size={22} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Click to choose and add files
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Supports multiple PDFs, Images, DOCX, PPTX (up to 15MB each)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MULTI-YOUTUBE SECTION WITH '+' BUTTON */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Video size={16} color="var(--danger)" />
                    <span>YouTube Video Lectures ({uploadData.youtubeLinks.length})</span>
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Add one or more YouTube lecture links to this study material.
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddUploadYoutube}
                  disabled={!uploadYoutubeInput.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={16} />
                  <span>Add Video</span>
                </button>
              </div>

              {/* Input Row with Add Button */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
                  value={uploadYoutubeInput}
                  onChange={(e) => setUploadYoutubeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUploadYoutube();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddUploadYoutube}
                  disabled={!uploadYoutubeInput.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', padding: '0.55rem 0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              {/* List of Added YouTube Links */}
              {uploadData.youtubeLinks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                  {uploadData.youtubeLinks.map((link, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        <Video size={18} color="var(--danger)" />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            Video Lecture #{idx + 1}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {link}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Open YouTube video in new tab"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleRemoveUploadYoutube(idx)}
                          title="Remove video link"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={uploadLoading}
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploadLoading}
              >
                {uploadLoading ? 'Saving & Uploading...' : `Save Study Material (${selectedFiles.length} files, ${uploadData.youtubeLinks.length + (uploadYoutubeInput.trim() ? 1 : 0)} videos)`}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: View Details (Clean File Listing & Actions - No Raw URLs)         */}
      {/* ========================================================================= */}
      {showDetailModal && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Study Material Details"
          maxWidth="680px"
          footer={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowDetailModal(false)}
              style={{ marginLeft: 'auto' }}
            >
              Close
            </button>
          }
        >
          {detailLoading ? (
            <LoadingSpinner text="Fetching study material details..." />
          ) : selectedMaterialDetail ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedMaterialDetail.title}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Category: <Badge variant="info">{selectedMaterialDetail.category || 'General'}</Badge>
                  </div>
                </div>
                <Badge variant={selectedMaterialDetail.status === 'active' ? 'success' : 'neutral'}>
                  {selectedMaterialDetail.status}
                </Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Associated Course:</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {selectedMaterialDetail.course?.name ? `${selectedMaterialDetail.course.name} (${selectedMaterialDetail.course.code})` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Published On:</span>
                  <div style={{ fontSize: '0.85rem' }}>
                    {selectedMaterialDetail.createdAt ? new Date(selectedMaterialDetail.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              {selectedMaterialDetail.description && (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Description:</span>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {selectedMaterialDetail.description}
                  </p>
                </div>
              )}

              {/* Attached Files List */}
              {(() => {
                const isYt = (url) => typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'));
                const realAttachedFiles = (selectedMaterialDetail.files || []).filter(
                  (f) => f && f.fileUrl && !isYt(f.fileUrl) && !(f.fileType === 'video' && (f.fileName || '').toLowerCase().includes('youtube'))
                );
                const hasLegacyFile = realAttachedFiles.length === 0 && selectedMaterialDetail.fileUrl && !isYt(selectedMaterialDetail.fileUrl) && selectedMaterialDetail.fileType !== 'video';
                const displayFiles = hasLegacyFile
                  ? [{
                      _id: selectedMaterialDetail._id,
                      fileUrl: selectedMaterialDetail.fileUrl,
                      fileName: selectedMaterialDetail.fileName || selectedMaterialDetail.title,
                      fileType: selectedMaterialDetail.fileType || 'pdf',
                      fileSize: selectedMaterialDetail.fileSize || 0
                    }]
                  : realAttachedFiles;

                return (
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                      Attached Documents ({displayFiles.length})
                    </span>

                    {displayFiles.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {displayFiles.map((file, idx) => {
                          const resolvedUrl = studyMaterialsApi.resolveFileUrl(file.fileUrl);
                          return (
                            <div
                              key={file._id || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                gap: '1rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                <FileText size={20} color="var(--primary)" />
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {file.fileName || `Document ${idx + 1}`}
                                  </span>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <Badge variant={getFileTypeBadgeVariant(file.fileType)}>
                                      {file.fileType?.toUpperCase() || 'PDF'}
                                    </Badge>
                                    <span>{formatFileSize(file.fileSize)}</span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <a
                                  href={resolvedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary btn-sm"
                                  title="Open in browser"
                                >
                                  <ExternalLink size={14} />
                                  <span>Open</span>
                                </a>
                                <a
                                  href={resolvedUrl}
                                  download={file.fileName || 'download'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  title="Download file"
                                >
                                  <Download size={14} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        No files attached to this study material.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* YouTube Links List */}
              {((selectedMaterialDetail.youtubeLinks && selectedMaterialDetail.youtubeLinks.length > 0) || selectedMaterialDetail.youtubeLink) && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
                    <YoutubeIcon size={16} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Video Lectures ({(selectedMaterialDetail.youtubeLinks?.length || (selectedMaterialDetail.youtubeLink ? 1 : 0))})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(selectedMaterialDetail.youtubeLinks?.length > 0
                      ? selectedMaterialDetail.youtubeLinks
                      : [selectedMaterialDetail.youtubeLink]
                    ).map((ytUrl, yIdx) => (
                      <div
                        key={yIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <YoutubeIcon size={18} />
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            Video Lecture #{yIdx + 1}
                          </span>
                        </div>
                        <a
                          href={ytUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <YoutubeIcon size={14} />
                          <span>Watch Video</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="alert alert-danger">Unable to load material record.</div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Edit Details & Manage Particular Files & Video Links             */}
      {/* ========================================================================= */}
      {showEditModal && editingMaterial && (
        <Modal
          isOpen={showEditModal}
          onClose={() => !editLoading && setShowEditModal(false)}
          title={`Edit Study Material: ${editingMaterial.title}`}
          maxWidth="680px"
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {editError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            <div>
              <label className="form-label">Material Title *</label>
              <input
                type="text"
                required
                maxLength={200}
                className="form-input"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Assigned Course</label>
                <select
                  className="form-input"
                  value={editData.course}
                  onChange={(e) => setEditData({ ...editData, course: e.target.value })}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Existing Files Management Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                    Attached Files ({editingMaterial.files?.length || 0})
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Delete or download existing files, or use + to add more files.
                  </span>
                </div>

                <input
                  type="file"
                  ref={editFileInputRef}
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleEditFilesSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.txt,.zip"
                />

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => editFileInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={16} />
                  <span>Add More Files</span>
                </button>
              </div>

              {/* List of currently attached files */}
              {editingMaterial.files && editingMaterial.files.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {editingMaterial.files.map((file) => (
                    <div
                      key={file._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        <FileText size={18} color="var(--primary)" />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {file.fileName}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {formatFileSize(file.fileSize)} &bull; {file.fileType?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <a
                          href={studyMaterialsApi.resolveFileUrl(file.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Open file"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          disabled={deletingFileId === file._id}
                          onClick={() => handleDeleteExistingFile(file._id)}
                          title="Delete this file"
                        >
                          {deletingFileId === file._id ? (
                            <span style={{ fontSize: '0.7rem' }}>...</span>
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem 0' }}>
                  No files currently attached. Use the "+ Add More Files" button above to upload files.
                </div>
              )}

              {/* Newly selected files staged for upload */}
              {editFilesToAdd.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>
                    New Files to be Uploaded on Save ({editFilesToAdd.length}):
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {editFilesToAdd.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'rgba(37, 99, 235, 0.05)',
                          border: '1px dashed var(--primary)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Plus size={14} color="var(--primary)" />
                          <span style={{ fontWeight: 500 }}>{file.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditFileToAdd(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: '0.2rem'
                          }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MULTI-YOUTUBE SECTION WITH '+' BUTTON IN EDIT MODAL */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Video size={16} color="var(--danger)" />
                    <span>YouTube Video Lectures ({editData.youtubeLinks.length})</span>
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Add or remove YouTube video lectures for this material.
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddEditYoutube}
                  disabled={!editYoutubeInput.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={16} />
                  <span>Add Video</span>
                </button>
              </div>

              {/* Input Row with Add Button */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
                  value={editYoutubeInput}
                  onChange={(e) => setEditYoutubeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEditYoutube();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddEditYoutube}
                  disabled={!editYoutubeInput.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', padding: '0.55rem 0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              {/* List of existing and added YouTube links */}
              {editData.youtubeLinks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                  {editData.youtubeLinks.map((link, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        <Video size={18} color="var(--danger)" />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            Video Lecture #{idx + 1}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {link}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Open YouTube video in new tab"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleRemoveEditYoutube(idx)}
                          title="Remove video link"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.25rem 0' }}>
                  No video lectures added yet.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={editLoading}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={editLoading}
              >
                {editLoading ? 'Saving Changes...' : 'Update Study Material'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Update Study Material Status (Step 5)                            */}
      {/* ========================================================================= */}
      {showStatusModal && targetMaterialForStatus && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => !statusLoading && setShowStatusModal(false)}
          title={`Update Status: ${targetMaterialForStatus.title}`}
          maxWidth="450px"
        >
          <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {statusError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{statusError}</span>
              </div>
            )}

            <div>
              <label className="form-label">Material Status</label>
              <select
                className="form-input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="active">Active (Visible to Students)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={statusLoading}
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={statusLoading}
              >
                {statusLoading ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Delete Study Material Confirmation (Step 6)                       */}
      {/* ========================================================================= */}
      {showDeleteModal && materialToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => !deleteLoading && setShowDeleteModal(false)}
          title="Delete Study Material"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {deleteError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to delete the study material:
              <strong style={{ display: 'block', marginTop: '0.4rem', color: 'var(--text-primary)' }}>
                {materialToDelete.title}
              </strong>
            </p>

            <div className="alert alert-warning" style={{ fontSize: '0.85rem' }}>
              This material and its associated files will be removed from student view.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={deleteLoading}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteLoading}
                onClick={handleDeleteSubmit}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
