import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { coursesApi } from '../../api/coursesApi';
import { studyMaterialsApi } from '../../api/studyMaterialsApi';
import { examinationsApi } from '../../api/examinationsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  BookOpen,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText,
  Lock,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Layers,
  Video,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Power,
  ExternalLink,
} from 'lucide-react';

export const TeacherCoursesPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  // State for courses list & pagination (Step 2)
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filters & Search (Step 2 query params)
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');

  // Modal: Create Course (Step 1)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    code: '',
    category: 'Postgraduate',
    description: '',
    youtubeLink: '',
    batches: '2026-2027, 2027-2028',
    status: 'active',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Modal: Edit Course Details (Step 4)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Modal: Course Details & Inspection (Step 3)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal: Map Study Materials (Step 6)
  const [showMapMaterialsModal, setShowMapMaterialsModal] = useState(false);
  const [targetCourseForMaterials, setTargetCourseForMaterials] = useState(null);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [mappingMaterialsError, setMappingMaterialsError] = useState('');

  // Modal: Map Examinations (Step 7)
  const [showMapExamsModal, setShowMapExamsModal] = useState(false);
  const [targetCourseForExams, setTargetCourseForExams] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedExamIds, setSelectedExamIds] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [mappingExamsError, setMappingExamsError] = useState('');

  // Modal: Delete Course (Step 8)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch Courses with all query params (Step 2)
  const fetchCourses = useCallback(async (pageOverride) => {
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
      if (categoryFilter.trim()) params.category = categoryFilter.trim();
      if (statusFilter.trim()) params.status = statusFilter.trim();

      const res = await coursesApi.getAllCourses(params);
      if (res.success) {
        setCourses(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve course directory.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, categoryFilter, statusFilter, sortOption]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const showFeedback = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Step 1: Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!createData.name.trim() || !createData.code.trim()) {
      setCreateError('Course title and unique code are required.');
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        name: createData.name.trim(),
        code: createData.code.trim().toUpperCase(),
        category: createData.category.trim() || 'General',
        description: createData.description.trim(),
        youtubeLink: createData.youtubeLink.trim() || undefined,
        batches: createData.batches.split(',').map((b) => b.trim()).filter(Boolean),
        status: createData.status,
      };

      const res = await coursesApi.createCourse(payload);
      if (res.success) {
        setShowCreateModal(false);
        setCreateData({
          name: '',
          code: '',
          category: 'Postgraduate',
          description: '',
          youtubeLink: '',
          batches: '2026-2027, 2027-2028',
          status: 'active',
        });
        showFeedback(`Course "${payload.name}" created successfully.`);
        fetchCourses(1);
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create course.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Step 3: Get Course by ID
  const handleInspectCourse = async (courseId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const res = await coursesApi.getCourseById(courseId);
      if (res.success) {
        setSelectedCourseDetail(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load full course details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Step 4: Open Edit Modal with prefilled values
  const handleOpenEdit = (course) => {
    setEditingCourse({
      _id: course._id,
      name: course.name || '',
      code: course.code || '',
      category: course.category || '',
      description: course.description || '',
      youtubeLink: course.youtubeLink || '',
      batches: Array.isArray(course.batches) ? course.batches.join(', ') : '',
      status: course.status || 'active',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editingCourse.name.trim() || !editingCourse.code.trim()) {
      setEditError('Course name and code cannot be empty.');
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        name: editingCourse.name.trim(),
        code: editingCourse.code.trim().toUpperCase(),
        category: editingCourse.category.trim(),
        description: editingCourse.description.trim(),
        youtubeLink: editingCourse.youtubeLink.trim() || null,
        batches: editingCourse.batches.split(',').map((b) => b.trim()).filter(Boolean),
        status: editingCourse.status,
      };

      const res = await coursesApi.updateCourse(editingCourse._id, payload);
      if (res.success) {
        setShowEditModal(false);
        showFeedback(`Course "${payload.name}" updated successfully.`);
        fetchCourses();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update course.');
    } finally {
      setEditLoading(false);
    }
  };

  // Step 5: Quick Toggle Course Status
  const handleToggleStatus = async (course) => {
    const nextStatus = course.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await coursesApi.updateCourseStatus(course._id, nextStatus);
      if (res.success) {
        showFeedback(`Course status set to ${nextStatus}.`);
        fetchCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to change course status.');
    }
  };

  // Step 6: Open & Handle Map Study Materials Modal
  const handleOpenMapMaterials = async (course) => {
    setTargetCourseForMaterials(course);
    setMappingMaterialsError('');
    setMaterialsLoading(true);
    setShowMapMaterialsModal(true);
    try {
      // Fetch full course details to know currently mapped materials
      const [courseRes, allMaterialsRes] = await Promise.all([
        coursesApi.getCourseById(course._id),
        studyMaterialsApi.getAllStudyMaterials(),
      ]);

      const currentMappedIds = (courseRes.data?.studyMaterials || []).map((m) =>
        typeof m === 'string' ? m : m._id
      );
      setSelectedMaterialIds(currentMappedIds);
      setAvailableMaterials(allMaterialsRes.data || []);
    } catch (err) {
      setMappingMaterialsError(err.message || 'Failed to load materials.');
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleSaveMappedMaterials = async () => {
    if (!targetCourseForMaterials) return;
    setMaterialsLoading(true);
    setMappingMaterialsError('');
    try {
      const res = await coursesApi.mapStudyMaterials(
        targetCourseForMaterials._id,
        selectedMaterialIds
      );
      if (res.success) {
        setShowMapMaterialsModal(false);
        showFeedback('Study materials mapped to course successfully.');
        fetchCourses();
      }
    } catch (err) {
      setMappingMaterialsError(err.message || 'Failed to map study materials.');
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Step 7: Open & Handle Map Examinations Modal
  const handleOpenMapExams = async (course) => {
    setTargetCourseForExams(course);
    setMappingExamsError('');
    setExamsLoading(true);
    setShowMapExamsModal(true);
    try {
      const [courseRes, allExamsRes] = await Promise.all([
        coursesApi.getCourseById(course._id),
        examinationsApi.getAllExaminations(),
      ]);

      const currentMappedIds = (courseRes.data?.examinations || []).map((ex) =>
        typeof ex === 'string' ? ex : ex._id
      );
      setSelectedExamIds(currentMappedIds);
      setAvailableExams(allExamsRes.data || []);
    } catch (err) {
      setMappingExamsError(err.message || 'Failed to load examinations.');
    } finally {
      setExamsLoading(false);
    }
  };

  const handleSaveMappedExams = async () => {
    if (!targetCourseForExams) return;
    setExamsLoading(true);
    setMappingExamsError('');
    try {
      const res = await coursesApi.mapExaminations(
        targetCourseForExams._id,
        selectedExamIds
      );
      if (res.success) {
        setShowMapExamsModal(false);
        showFeedback('Examinations mapped to course successfully.');
        fetchCourses();
      }
    } catch (err) {
      setMappingExamsError(err.message || 'Failed to map examinations.');
    } finally {
      setExamsLoading(false);
    }
  };

  // Step 8: Delete Course (Soft Delete)
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await coursesApi.deleteCourse(courseToDelete._id);
      if (res.success) {
        setShowDeleteModal(false);
        setCourseToDelete(null);
        showFeedback('Course deleted successfully.');
        fetchCourses();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete course.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Degree Programs & Courses</h1>
          <p style={{ margin: 0 }}>
            Academic degrees, curriculum mapping, batch configurations, and syllabus management.
          </p>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Create New Course</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            disabled
            title="Administrator privileges required to create courses"
          >
            <Lock size={15} />
            <span>Create Course (Admin Only)</span>
          </button>
        )}
      </div>

      {/* Dynamic Feedback Banner */}
      {successMessage && (
        <div className="alert alert-success" style={{ margin: 0 }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ margin: 0 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Query Filter Toolbar (Step 2 Implementation) */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by course name, code, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Technical">Technical</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '140px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="code">Code (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {(search || categoryFilter || statusFilter || sortOption !== '-createdAt') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setStatusFilter('');
                setSortOption('-createdAt');
              }}
              className="btn btn-secondary btn-sm"
              title="Reset search & filters"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Counter & Status Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>
            Showing <strong>{courses.length}</strong> of <strong>{pagination.total || courses.length}</strong> registered courses
          </span>
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving degree programs and curriculum..." />
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-2">
          {courses.map((c) => (
            <div
              key={c._id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderLeft: c.status === 'active' ? '4px solid var(--primary)' : '4px solid var(--border)',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge variant={c.status === 'active' ? 'success' : 'neutral'}>
                    {c.status || 'Active'}
                  </Badge>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {c.category || 'General'}
                  </span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                  {c.code}
                </span>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                {c.name}
              </h3>

              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem', flex: 1, color: 'var(--text-secondary)' }}>
                {c.description || 'Program curriculum, enrolled cohorts, and examination schedules.'}
              </p>

              {/* Batches Pill List */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Academic Batches:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {c.batches && c.batches.length > 0 ? (
                    c.batches.map((b, bIdx) => (
                      <span key={bIdx} className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        {b}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No batches assigned</span>
                  )}
                </div>
              </div>

              {/* Mapped Stats Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                }}
              >
                <span>Study Materials: <strong>{c.studyMaterials?.length || 0}</strong></span>
                <span>Examinations: <strong>{c.examinations?.length || 0}</strong></span>
              </div>

              {/* Admin Actions Toolbar: Strictly Preview, Edit, Delete */}
              {isAdmin && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px dashed var(--border-subtle)',
                  }}
                >
                  <a
                    href={`/teacher/courses/${c._id}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Preview Course Curriculum in New Tab"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </a>

                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="btn btn-secondary btn-sm"
                    title="Edit Course, Status, & Mappings"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setCourseToDelete(c);
                      setShowDeleteModal(true);
                    }}
                    className="btn btn-danger btn-sm"
                    style={{ marginLeft: 'auto' }}
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your search criteria, category filter, or status."
        />
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchCourses(pagination.page - 1)}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchCourses(pagination.page + 1)}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Step 1 Modal: Create New Course */}
      {/* ========================================================================= */}
      {isAdmin && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Academic Course"
          maxWidth="560px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCourse}
                className="btn btn-primary"
                disabled={createLoading}
              >
                {createLoading ? 'Saving Course...' : 'Create Course'}
              </button>
            </div>
          }
        >
          {createError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateCourse}>
            <div className="form-group">
              <label className="form-label">Course Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Master of Computer Applications"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Course Code <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MCA"
                  value={createData.code}
                  onChange={(e) => setCreateData({ ...createData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Academic Category</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Postgraduate"
                  value={createData.category}
                  onChange={(e) => setCreateData({ ...createData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Intro YouTube Video URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={createData.youtubeLink}
                onChange={(e) => setCreateData({ ...createData, youtubeLink: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Description</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Curriculum overview and syllabus scope..."
                value={createData.description}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Batches (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2026-2027, 2027-2028"
                  value={createData.batches}
                  onChange={(e) => setCreateData({ ...createData, batches: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={createData.status}
                  onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Step 3 Modal: Course Inspection & Details */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Course Specification & Metadata"
        maxWidth="650px"
        footer={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowDetailModal(false)}
          >
            Close Details
          </button>
        }
      >
        {detailLoading || !selectedCourseDetail ? (
          <LoadingSpinner text="Retrieving comprehensive course record..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.25rem 0' }}>{selectedCourseDetail.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 700 }}>
                  Code: {selectedCourseDetail.code}
                </span>
              </div>
              <Badge variant={selectedCourseDetail.status === 'active' ? 'success' : 'neutral'}>
                {selectedCourseDetail.status}
              </Badge>
            </div>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
              <strong>MongoDB ObjectId:</strong> <code>{selectedCourseDetail._id}</code>
            </div>

            <p style={{ fontSize: '0.925rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }}>
              {selectedCourseDetail.description || 'No description provided.'}
            </p>

            {selectedCourseDetail.youtubeLink && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Video size={16} color="var(--danger)" />
                <a
                  href={selectedCourseDetail.youtubeLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}
                >
                  Watch Course Intro Video
                </a>
              </div>
            )}

            {/* Mapped Study Materials Section */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} />
                <span>Associated Study Materials ({selectedCourseDetail.studyMaterials?.length || 0})</span>
              </h4>
              {selectedCourseDetail.studyMaterials && selectedCourseDetail.studyMaterials.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {selectedCourseDetail.studyMaterials.map((mat) => (
                    <div
                      key={mat._id}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{mat.title}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{mat.fileType || 'Document'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No study materials mapped to this course.</span>
              )}
            </div>

            {/* Mapped Examinations Section */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} />
                <span>Associated Examinations ({selectedCourseDetail.examinations?.length || 0})</span>
              </h4>
              {selectedCourseDetail.examinations && selectedCourseDetail.examinations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {selectedCourseDetail.examinations.map((ex) => (
                    <div
                      key={ex._id}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{ex.title}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{ex.totalMarks || 20} Marks</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No examinations mapped to this course.</span>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* Step 4 Modal: Edit Course Details */}
      {/* ========================================================================= */}
      {isAdmin && editingCourse && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit Course: ${editingCourse.name}`}
          maxWidth="560px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateCourse}
                className="btn btn-primary"
                disabled={editLoading}
              >
                {editLoading ? 'Saving Changes...' : 'Save Updates'}
              </button>
            </div>
          }
        >
          {editError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateCourse}>
            <div className="form-group">
              <label className="form-label">Course Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                className="form-input"
                value={editingCourse.name}
                onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Course Code <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCourse.code}
                  onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Academic Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCourse.category}
                  onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">YouTube Intro URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={editingCourse.youtubeLink}
                onChange={(e) => setEditingCourse({ ...editingCourse, youtubeLink: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={editingCourse.description}
                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Batches (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCourse.batches}
                  onChange={(e) => setEditingCourse({ ...editingCourse, batches: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editingCourse.status}
                  onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Mapped Features Management Section inside Edit */}
            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px dashed var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Advanced Course Linkages:
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    handleOpenMapMaterials(editingCourse);
                  }}
                  title="Manage Mapped Study Materials"
                >
                  <FileText size={14} />
                  <span>Manage Study Materials ({editingCourse.studyMaterials?.length || 0})</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    handleOpenMapExams(editingCourse);
                  }}
                  title="Manage Mapped Examinations"
                >
                  <Calendar size={14} />
                  <span>Manage Examinations ({editingCourse.examinations?.length || 0})</span>
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Step 6 Modal: Map Study Materials */}
      {/* ========================================================================= */}
      {isAdmin && targetCourseForMaterials && (
        <Modal
          isOpen={showMapMaterialsModal}
          onClose={() => setShowMapMaterialsModal(false)}
          title={`Map Study Materials: ${targetCourseForMaterials.name}`}
          maxWidth="600px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowMapMaterialsModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMappedMaterials}
                className="btn btn-primary"
                disabled={materialsLoading}
              >
                {materialsLoading ? 'Saving Mapping...' : `Save Mapped Materials (${selectedMaterialIds.length})`}
              </button>
            </div>
          }
        >
          {mappingMaterialsError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{mappingMaterialsError}</span>
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select materials to associate directly with this course. All selected materials will be populated when students view this course.
          </p>

          {materialsLoading ? (
            <LoadingSpinner text="Retrieving available materials catalog..." />
          ) : availableMaterials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {availableMaterials.map((mat) => {
                const isChecked = selectedMaterialIds.includes(mat._id);
                return (
                  <label
                    key={mat._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'rgba(27, 77, 62, 0.08)' : 'var(--bg-tertiary)',
                      border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMaterialIds([...selectedMaterialIds, mat._id]);
                        } else {
                          setSelectedMaterialIds(selectedMaterialIds.filter((id) => id !== mat._id));
                        }
                      }}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{mat.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Category: {mat.category || 'General'} • Type: {mat.fileType || 'PDF'}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              No study materials have been uploaded yet. Upload materials first in the Materials page.
            </div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Step 7 Modal: Map Examinations */}
      {/* ========================================================================= */}
      {isAdmin && targetCourseForExams && (
        <Modal
          isOpen={showMapExamsModal}
          onClose={() => setShowMapExamsModal(false)}
          title={`Map Examinations: ${targetCourseForExams.name}`}
          maxWidth="600px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowMapExamsModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMappedExams}
                className="btn btn-primary"
                disabled={examsLoading}
              >
                {examsLoading ? 'Saving Mapping...' : `Save Mapped Exams (${selectedExamIds.length})`}
              </button>
            </div>
          }
        >
          {mappingExamsError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{mappingExamsError}</span>
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select examinations to bind to this degree program. Students enrolled in this course will be eligible to attempt these examinations.
          </p>

          {examsLoading ? (
            <LoadingSpinner text="Retrieving examinations bank..." />
          ) : availableExams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {availableExams.map((ex) => {
                const isChecked = selectedExamIds.includes(ex._id);
                return (
                  <label
                    key={ex._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'rgba(217, 119, 6, 0.08)' : 'var(--bg-tertiary)',
                      border: isChecked ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExamIds([...selectedExamIds, ex._id]);
                        } else {
                          setSelectedExamIds(selectedExamIds.filter((id) => id !== ex._id));
                        }
                      }}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ex.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Status: {ex.status} • Marks: {ex.totalMarks || 20}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              No examinations have been created yet. Create examinations in the Examinations tab first.
            </div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Step 8 Modal: Confirm Delete Course */}
      {/* ========================================================================= */}
      {isAdmin && courseToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirm Soft Delete Course"
          maxWidth="460px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-danger"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Course'}
              </button>
            </div>
          }
        >
          {deleteError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{deleteError}</span>
            </div>
          )}

          <p style={{ fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
            Are you sure you want to delete <strong>{courseToDelete.name}</strong> (Code: <code>{courseToDelete.code}</code>)?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            This course will be marked as inactive and removed from public student listings. Existing enrolled students will preserve historical data.
          </p>
        </Modal>
      )}
    </div>
  );
};
