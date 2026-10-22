import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { studentsApi } from '../../api/studentsApi';
import { coursesApi } from '../../api/coursesApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Award,
  Lock,
  Plus,
  Edit3,
  Trash2,
  Eye,
  BookOpen,
  RefreshCw,
  Filter,
  ShieldAlert,
  ArrowUpDown,
  Mail,
  Phone,
  Hash,
  Clock,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherStudentsPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  // --- Student List & Pagination (Step 2) ---
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // --- Filter & Sorting States (Step 2 Query Parameters) ---
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');

  // --- Reference Data ---
  const [coursesList, setCoursesList] = useState([]);

  // --- Modal: Step 1 (Create Student) ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    phone: '',
    course: '',
    batch: '',
    status: 'active',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // --- Modal: Step 3 (Get Student Details by ID) ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // --- Modal: Step 4 (Update Student Details) ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    batch: '',
    status: 'active',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // --- Modal: Step 5 (Update Student Status) ---
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStudentForStatus, setTargetStudentForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // --- Modal: Step 6 (Update Student Course and Batch) ---
  const [showCourseBatchModal, setShowCourseBatchModal] = useState(false);
  const [targetStudentForCourseBatch, setTargetStudentForCourseBatch] = useState(null);
  const [courseBatchData, setCourseBatchData] = useState({ courseId: '', batch: '' });
  const [courseBatchLoading, setCourseBatchLoading] = useState(false);
  const [courseBatchError, setCourseBatchError] = useState('');

  // --- Modal: Step 7 (Student Examination History) ---
  const [showExamsModal, setShowExamsModal] = useState(false);
  const [selectedStudentForExams, setSelectedStudentForExams] = useState(null);
  const [studentExams, setStudentExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);

  // --- Modal: Step 8 (Student Results Records) ---
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedStudentForResults, setSelectedStudentForResults] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // --- Modal: Step 9 (Soft Delete Student) ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Load available courses for dropdown selections
  useEffect(() => {
    if (!isAdmin) return;
    const loadCourses = async () => {
      try {
        const res = await coursesApi.getAllCourses({ limit: 100, status: 'active' });
        if (res.data) setCoursesList(res.data);
      } catch (err) {
        console.warn('Could not load courses for student dropdowns:', err.message);
      }
    };
    loadCourses();
  }, [isAdmin]);

  // Fetch Students with search, filters, pagination, and sorting (Step 2)
  const fetchStudents = useCallback(async (pageOverride) => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

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
      if (statusFilter) params.status = statusFilter;
      if (courseFilter) params.course = courseFilter;
      if (batchFilter.trim()) params.batch = batchFilter.trim();

      const res = await studentsApi.getAllStudents(params);
      if (res.success) {
        setStudents(res.data || []);
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
      setError(err.message || 'Unable to retrieve students roster.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, pagination.page, pagination.limit, sortOption, search, statusFilter, courseFilter, batchFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Quick Flash Notification
  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Filter Form Submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCourseFilter('');
    setBatchFilter('');
    setSortOption('-createdAt');
    fetchStudents(1);
  };

  // ----------------------------------------------------
  // Step 1: Create Student Handler
  // ----------------------------------------------------
  const handleOpenCreateModal = () => {
    setCreateData({
      name: '',
      email: '',
      studentId: '',
      password: '',
      phone: '',
      course: coursesList[0]?._id || '',
      batch: coursesList[0]?.batches?.[0] || '2026',
      status: 'active',
    });
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      if (!createData.course) {
        throw new Error('Please select an active course.');
      }
      if (!createData.studentId.trim()) {
        throw new Error('Student ID / Roll Number is required.');
      }
      if (createData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const payload = {
        name: createData.name.trim(),
        email: createData.email.trim(),
        studentId: createData.studentId.trim().toUpperCase(),
        password: createData.password,
        phone: createData.phone.trim() || undefined,
        course: createData.course,
        batch: createData.batch.trim(),
        status: createData.status,
      };

      const res = await studentsApi.createStudent(payload);
      if (res.success) {
        setShowCreateModal(false);
        triggerSuccess(`Student '${res.data?.name || payload.name}' created successfully with ID ${payload.studentId}!`);
        fetchStudents(1);
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create student. Please verify input data.');
    } finally {
      setCreateLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 3: Get Student by ID Handler
  // ----------------------------------------------------
  const handleViewStudentDetails = async (studentId) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await studentsApi.getStudentById(studentId);
      if (res.success && res.data) {
        setStudentDetail(res.data);
      }
    } catch (err) {
      console.error('Could not fetch student details:', err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 4: Update Student Details Handler
  // ----------------------------------------------------
  const handleOpenEditModal = (stud) => {
    setEditingStudent(stud);
    setEditData({
      name: stud.name || '',
      email: stud.email || '',
      phone: stud.phone || '',
      course: stud.course?._id || stud.course || '',
      batch: stud.batch || '',
      status: stud.status || 'active',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditLoading(true);
    setEditError('');

    try {
      const payload = {
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim() || undefined,
        course: editData.course,
        batch: editData.batch.trim(),
        status: editData.status,
      };

      const res = await studentsApi.updateStudent(editingStudent._id, payload);
      if (res.success) {
        setShowEditModal(false);
        triggerSuccess(`Student '${editingStudent.name}' updated successfully!`);
        fetchStudents();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update student details.');
    } finally {
      setEditLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 5: Update Student Status Handler
  // ----------------------------------------------------
  const handleOpenStatusModal = (stud) => {
    setTargetStudentForStatus(stud);
    setSelectedStatus(stud.status || 'active');
    setStatusError('');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetStudentForStatus) return;
    setStatusLoading(true);
    setStatusError('');

    try {
      const res = await studentsApi.updateStudentStatus(targetStudentForStatus._id, selectedStatus);
      if (res.success) {
        setShowStatusModal(false);
        triggerSuccess(res.message || `Student status updated to '${selectedStatus}'.`);
        fetchStudents();
      }
    } catch (err) {
      setStatusError(err.message || 'Failed to update student status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 6: Update Student Course & Batch Handler
  // ----------------------------------------------------
  const handleOpenCourseBatchModal = (stud) => {
    setTargetStudentForCourseBatch(stud);
    setCourseBatchData({
      courseId: stud.course?._id || stud.course || (coursesList[0]?._id || ''),
      batch: stud.batch || '2026',
    });
    setCourseBatchError('');
    setShowCourseBatchModal(true);
  };

  const handleCourseBatchSubmit = async (e) => {
    e.preventDefault();
    if (!targetStudentForCourseBatch) return;
    setCourseBatchLoading(true);
    setCourseBatchError('');

    try {
      if (!courseBatchData.courseId) {
        throw new Error('Please select an active course.');
      }
      if (!courseBatchData.batch.trim()) {
        throw new Error('Batch assignment is required.');
      }

      const res = await studentsApi.updateStudentCourseBatch(
        targetStudentForCourseBatch._id,
        courseBatchData.courseId,
        courseBatchData.batch.trim()
      );
      if (res.success) {
        setShowCourseBatchModal(false);
        triggerSuccess(`Student '${targetStudentForCourseBatch.name}' course & batch updated successfully!`);
        fetchStudents();
      }
    } catch (err) {
      setCourseBatchError(err.message || 'Failed to update student course and batch assignment.');
    } finally {
      setCourseBatchLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 7: Get Student Examination History Handler
  // ----------------------------------------------------
  const handleViewExams = async (stud) => {
    setSelectedStudentForExams(stud);
    setShowExamsModal(true);
    setExamsLoading(true);
    try {
      const res = await studentsApi.getStudentExaminations(stud._id);
      if (res.data) {
        setStudentExams(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch student exams:', err.message);
    } finally {
      setExamsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 8: Get Student Results Handler
  // ----------------------------------------------------
  const handleViewResults = async (stud) => {
    setSelectedStudentForResults(stud);
    setShowResultsModal(true);
    setResultsLoading(true);
    try {
      const res = await studentsApi.getStudentResults(stud._id);
      if (res.data) {
        setStudentResults(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch student results:', err.message);
    } finally {
      setResultsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 9: Delete Student Handler (Soft Delete)
  // ----------------------------------------------------
  const handleOpenDeleteModal = (stud) => {
    setStudentToDelete(stud);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!studentToDelete) return;
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await studentsApi.deleteStudent(studentToDelete._id);
      if (res.success) {
        setShowDeleteModal(false);
        triggerSuccess(`Student '${studentToDelete.name}' has been soft-deleted successfully.`);
        fetchStudents();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to remove student record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="neutral">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="danger">Suspended</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Unauthorized Screen
  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student Management Portal</h1>
          <p style={{ margin: 0 }}>
            Student admissions, registration IDs, course batch management, and examination records.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
          <Lock size={42} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.75rem' }}>Administrator Authorization Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: '1.7' }}>
            The <code>/api/v1/students</code> endpoints enforce strict administrative authorization (<code>protectAdmin</code>). To inspect candidate records, reassign courses, and manage student accounts, please authenticate as an Administrator.
          </p>
          <Link to="/login/admin" className="btn btn-primary">
            Sign In to Administrator Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem', fontWeight: 800 }}>Student Management</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Complete administration of student registrations, course batches, exam histories, and transcripts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchStudents()}
            title="Refresh student roster"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
          >
            <Plus size={16} />
            <span>Add Student (Step 1)</span>
          </button>
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

      {/* Filter and Search Bar (Step 2 Query Parameters) */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Search Input */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Search (Name, Email, Roll No, Phone)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul, STU1001..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Filter by Status</label>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
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
                {coursesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Filter by Batch</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2026 or 2026-2027"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              />
            </div>

            {/* Sort Option */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Sort By</label>
              <select
                className="form-input"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="-createdAt">Newest First (createdAt desc)</option>
                <option value="createdAt">Oldest First (createdAt asc)</option>
                <option value="name">Name (A-Z)</option>
                <option value="-name">Name (Z-A)</option>
                <option value="studentId">Student ID (Ascending)</option>
                <option value="-studentId">Student ID (Descending)</option>
                <option value="status">Status (Ascending)</option>
                <option value="-status">Status (Descending)</option>
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

      {/* Main Student Records Table */}
      {loading ? (
        <LoadingSpinner fullPage text="Retrieving student records from database..." />
      ) : students.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Contact</th>
                  <th>Course & Batch</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{s.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {s.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: 'var(--primary-light)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {s.studentId}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {s.phone ? (
                          <span>{s.phone}</span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{s.course?.code || s.course?.name || 'N/A'}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Batch: {s.batch}
                        </div>
                      </div>
                    </td>
                    <td>
                      {renderStatusBadge(s.status)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Preview in New Tab */}
                        <a
                          href={`/teacher/students/${s._id}/preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Preview Student in New Tab"
                        >
                          <Eye size={14} />
                        </a>

                        {/* Edit Student (Details, Status, Course & Batch) */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditModal(s)}
                          title="Edit Student Profile & Academic Assignment"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete Student */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleOpenDeleteModal(s)}
                          title="Delete Student Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} registered students)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchStudents(pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchStudents(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No students found"
          description={search || statusFilter || courseFilter || batchFilter ? "No students matched your search criteria. Try clearing some filters." : "No registered students in database. Click 'Add Student' to create the first record."}
          action={
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={16} />
              <span>Add Student (Step 1)</span>
            </button>
          }
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Create Student (Step 1 - POST /api/v1/students)                 */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => !createLoading && setShowCreateModal(false)}
          title="Create New Student (Step 1)"
          maxWidth="640px"
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {createError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{createError}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. rahul@example.com"
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Student ID / Roll No *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. STU1001"
                  value={createData.studentId}
                  onChange={(e) => setCreateData({ ...createData, studentId: e.target.value.toUpperCase() })}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Will be converted to uppercase automatically.</small>
              </div>

              <div>
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={createData.phone}
                  onChange={(e) => setCreateData({ ...createData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Account Status</label>
                <select
                  className="form-input"
                  value={createData.status}
                  onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div>
                <label className="form-label">Assign Course *</label>
                <select
                  required
                  className="form-input"
                  value={createData.course}
                  onChange={(e) => {
                    const selCourse = coursesList.find((c) => c._id === e.target.value);
                    setCreateData({
                      ...createData,
                      course: e.target.value,
                      batch: selCourse?.batches?.[0] || createData.batch || '2026',
                    });
                  }}
                >
                  <option value="">-- Select Course --</option>
                  {coursesList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Batch Assignment *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. 2026 or 2026-2027"
                  value={createData.batch}
                  onChange={(e) => setCreateData({ ...createData, batch: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={createLoading}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createLoading}
              >
                {createLoading ? 'Registering Student...' : 'Create Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: View Student Details (Step 3 - GET /api/v1/students/:id)         */}
      {/* ========================================================================= */}
      {showDetailModal && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Student Record Profile (Step 3)"
          maxWidth="640px"
          footer={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowDetailModal(false)}
            >
              Close
            </button>
          }
        >
          {detailLoading ? (
            <LoadingSpinner text="Fetching student profile..." />
          ) : studentDetail ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{studentDetail.name}</h3>
                  <code style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{studentDetail.studentId}</code>
                </div>
                <div>{renderStatusBadge(studentDetail.status)}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email:</span>
                  <div style={{ fontSize: '0.9rem' }}>{studentDetail.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone:</span>
                  <div style={{ fontSize: '0.9rem' }}>{studentDetail.phone || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role:</span>
                  <div style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{studentDetail.role || 'student'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned Course:</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {studentDetail.course?.name ? `${studentDetail.course.name} (${studentDetail.course.code})` : 'N/A'}
                  </div>
                  {studentDetail.course?.category && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category: {studentDetail.course.category}</span>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned Batch:</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{studentDetail.batch}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enrolled Date:</span>
                  <div style={{ fontSize: '0.85rem' }}>
                    {studentDetail.enrolledDate ? new Date(studentDetail.enrolledDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Active / Login:</span>
                  <div style={{ fontSize: '0.85rem' }}>
                    {studentDetail.lastLogin ? new Date(studentDetail.lastLogin).toLocaleString() : 'Never logged in'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Record Created:</span>
                  <div style={{ fontSize: '0.85rem' }}>
                    {studentDetail.createdAt ? new Date(studentDetail.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Soft-Deleted Status:</span>
                  <div style={{ fontSize: '0.85rem' }}>{studentDetail.isDeleted ? 'Yes (Deleted)' : 'No (Active Record)'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">Unable to load student record.</div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Edit Student Details (Step 4 - PATCH /api/v1/students/:id)       */}
      {/* ========================================================================= */}
      {showEditModal && editingStudent && (
        <Modal
          isOpen={showEditModal}
          onClose={() => !editLoading && setShowEditModal(false)}
          title={`Edit Student Details: ${editingStudent.name} (${editingStudent.studentId})`}
          maxWidth="640px"
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {editError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Note: <code>studentId</code> and <code>password</code> cannot be updated through this endpoint.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  className="form-input"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
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
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="form-label">Course</label>
                <select
                  className="form-input"
                  value={editData.course}
                  onChange={(e) => setEditData({ ...editData, course: e.target.value })}
                >
                  <option value="">-- Select Course --</option>
                  {coursesList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Batch</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.batch}
                  onChange={(e) => setEditData({ ...editData, batch: e.target.value })}
                />
              </div>
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
                {editLoading ? 'Saving Changes...' : 'Save Student Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Update Student Status (Step 5 - PATCH /students/:id/status)      */}
      {/* ========================================================================= */}
      {showStatusModal && targetStudentForStatus && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => !statusLoading && setShowStatusModal(false)}
          title={`Update Status: ${targetStudentForStatus.name} (${targetStudentForStatus.studentId})`}
          maxWidth="460px"
        >
          <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {statusError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{statusError}</span>
              </div>
            )}

            <div>
              <label className="form-label">Account Lifecycle Status</label>
              <select
                className="form-input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="active">Active (Full access)</option>
                <option value="inactive">Inactive (Access disabled)</option>
                <option value="suspended">Suspended (Disciplinary suspension)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
                {statusLoading ? 'Updating Status...' : 'Apply Status Change'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Update Course & Batch (Step 6 - PATCH /students/:id/course-batch)*/}
      {/* ========================================================================= */}
      {showCourseBatchModal && targetStudentForCourseBatch && (
        <Modal
          isOpen={showCourseBatchModal}
          onClose={() => !courseBatchLoading && setShowCourseBatchModal(false)}
          title={`Reassign Course & Batch: ${targetStudentForCourseBatch.name}`}
          maxWidth="520px"
        >
          <form onSubmit={handleCourseBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {courseBatchError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{courseBatchError}</span>
              </div>
            )}

            <div>
              <label className="form-label">New Course Assignment *</label>
              <select
                required
                className="form-input"
                value={courseBatchData.courseId}
                onChange={(e) => {
                  const sel = coursesList.find((c) => c._id === e.target.value);
                  setCourseBatchData({
                    ...courseBatchData,
                    courseId: e.target.value,
                    batch: sel?.batches?.[0] || courseBatchData.batch || '2027',
                  });
                }}
              >
                <option value="">-- Select Active Course --</option>
                {coursesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">New Batch Assignment *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 2027"
                value={courseBatchData.batch}
                onChange={(e) => setCourseBatchData({ ...courseBatchData, batch: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={courseBatchLoading}
                onClick={() => setShowCourseBatchModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={courseBatchLoading}
              >
                {courseBatchLoading ? 'Updating...' : 'Update Course & Batch'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: Examination History (Step 7 - GET /students/:id/examinations)    */}
      {/* ========================================================================= */}
      {showExamsModal && selectedStudentForExams && (
        <Modal
          isOpen={showExamsModal}
          onClose={() => setShowExamsModal(false)}
          title={`Exam History: ${selectedStudentForExams.name} (${selectedStudentForExams.studentId})`}
          maxWidth="750px"
          footer={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowExamsModal(false)}
            >
              Close
            </button>
          }
        >
          {examsLoading ? (
            <LoadingSpinner text="Loading candidate examination records..." />
          ) : studentExams.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Examination Title</th>
                    <th>Marks (Total / Pass)</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Attempt</th>
                  </tr>
                </thead>
                <tbody>
                  {studentExams.map((ex, idx) => (
                    <tr key={ex._id || idx}>
                      <td>
                        <strong>{ex.examination?.title || 'Examination Assessment'}</strong>
                      </td>
                      <td>
                        {ex.examination ? (
                          <span>
                            {ex.examination.totalMarks} Total / {ex.examination.passingMarks} Pass
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>{ex.examination?.durationMinutes ? `${ex.examination.durationMinutes} mins` : 'N/A'}</td>
                      <td>
                        <Badge variant={ex.status === 'submitted' || ex.status === 'evaluated' ? 'success' : 'neutral'}>
                          {ex.status}
                        </Badge>
                      </td>
                      <td>Attempt #{ex.attemptNumber || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No examination attempts recorded"
              description="This candidate has not attempted or submitted any scheduled assessments yet."
            />
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: Student Results (Step 8 - GET /students/:id/results)             */}
      {/* ========================================================================= */}
      {showResultsModal && selectedStudentForResults && (
        <Modal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          title={`Academic Results: ${selectedStudentForResults.name} (${selectedStudentForResults.studentId})`}
          maxWidth="750px"
          footer={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowResultsModal(false)}
            >
              Close
            </button>
          }
        >
          {resultsLoading ? (
            <LoadingSpinner text="Retrieving student result records..." />
          ) : studentResults.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Examination</th>
                    <th>Course</th>
                    <th>Obtained</th>
                    <th>Percentage</th>
                    <th>Result Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentResults.map((resItem, idx) => (
                    <tr key={resItem._id || idx}>
                      <td>
                        <strong>{resItem.examination?.title || 'Examination'}</strong>
                      </td>
                      <td>{resItem.course?.code || resItem.course?.name || 'N/A'}</td>
                      <td>
                        <strong>{resItem.obtainedMarks ?? 'N/A'}</strong> / {resItem.examination?.totalMarks || 100}
                      </td>
                      <td>
                        {resItem.percentage !== undefined ? `${Math.round(resItem.percentage)}%` : 'N/A'}
                      </td>
                      <td>
                        <Badge variant={resItem.isPassed ? 'success' : 'danger'}>
                          {resItem.isPassed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No academic results found"
              description="No graded exam result records are published for this student yet."
            />
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: Soft Delete Student (Step 9 - DELETE /students/:id)              */}
      {/* ========================================================================= */}
      {showDeleteModal && studentToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => !deleteLoading && setShowDeleteModal(false)}
          title={`Remove Student: ${studentToDelete.name}`}
          maxWidth="500px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {deleteError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  padding: '0.75rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Confirm Student Deletion?</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Are you sure you want to remove <strong>{studentToDelete.name}</strong> (<code>{studentToDelete.studentId}</code>)?
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  This action performs a <strong>soft delete</strong> (setting <code>isDeleted: true</code> and status to <code>inactive</code>). The student will no longer be able to log in or appear in active rosters.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
                {deleteLoading ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
