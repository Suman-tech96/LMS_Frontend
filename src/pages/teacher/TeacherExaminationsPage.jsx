import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { examinationsApi } from '../../api/examinationsApi';
import { coursesApi } from '../../api/coursesApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Plus,
  HelpCircle,
  Clock,
  Award,
  AlertCircle,
  Lock,
  Layers,
  ArrowRight,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Power,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const TeacherExaminationsPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  // Exams list & pagination (Step 2)
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Filters & Search (Step 2 query parameters)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');

  const getInitialDates = () => {
    const now = new Date();
    const startObj = new Date(now.getTime() + 15 * 60000);
    const endObj = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const toInputVal = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { start: toInputVal(startObj), end: toInputVal(endObj) };
  };

  const defaultQuestionTemplate = () => ({
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0,
    explanation: '',
  });

  // Modal: Create Examination (Step 1)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    instructions: '1. Read each question carefully.\n2. Once started, you must complete the test within the allocated duration.\n3. The exam will automatically submit when the timer expires.',
    course: '',
    targetBatches: '',
    startDate: '',
    endDate: '',
    durationMinutes: 30,
    totalMarks: 10,
    passingMarks: 5,
    negativeMarks: 0,
    maxAttempts: 1,
    status: 'scheduled',
    isPublished: true,
    questions: [defaultQuestionTemplate()],
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleOpenCreateModal = () => {
    const defaultCourse = courses[0];
    const dates = getInitialDates();
    setCreateData({
      title: '',
      description: '',
      instructions: '1. Read each question carefully.\n2. Once started, you must complete the test within the allocated duration.\n3. The exam will automatically submit when the timer expires.',
      course: defaultCourse?._id || '',
      targetBatches: defaultCourse?.batches?.join(', ') || '2026',
      startDate: dates.start,
      endDate: dates.end,
      durationMinutes: 30,
      totalMarks: 10,
      passingMarks: 5,
      negativeMarks: 0,
      maxAttempts: 1,
      status: 'scheduled',
      isPublished: true,
      questions: [defaultQuestionTemplate()],
    });
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleCourseChangeInCreate = (courseId) => {
    const found = courses.find((c) => c._id === courseId);
    setCreateData((prev) => ({
      ...prev,
      course: courseId,
      targetBatches: found?.batches?.join(', ') || prev.targetBatches || '2026',
    }));
  };

  // Dynamic question management
  const handleAddQuestion = () => {
    setCreateData((prev) => ({
      ...prev,
      questions: [...prev.questions, defaultQuestionTemplate()],
    }));
  };

  const handleRemoveQuestion = (qIndex) => {
    if (createData.questions.length <= 1) return;
    setCreateData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIndex),
    }));
  };

  const handleQuestionFieldChange = (qIndex, field, value) => {
    setCreateData((prev) => {
      const updated = [...prev.questions];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const handleAddOption = (qIndex) => {
    setCreateData((prev) => {
      const updated = [...prev.questions];
      updated[qIndex] = {
        ...updated[qIndex],
        options: [...updated[qIndex].options, ''],
      };
      return { ...prev, questions: updated };
    });
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setCreateData((prev) => {
      const updated = [...prev.questions];
      const curOptions = updated[qIndex].options;
      if (curOptions.length <= 2) return prev;
      const newOptions = curOptions.filter((_, idx) => idx !== optIndex);
      let newCorrect = updated[qIndex].correctOptionIndex;
      if (newCorrect >= newOptions.length) newCorrect = 0;
      updated[qIndex] = {
        ...updated[qIndex],
        options: newOptions,
        correctOptionIndex: newCorrect,
      };
      return { ...prev, questions: updated };
    });
  };

  const handleOptionTextChange = (qIndex, optIndex, value) => {
    setCreateData((prev) => {
      const updated = [...prev.questions];
      const newOptions = [...updated[qIndex].options];
      newOptions[optIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options: newOptions };
      return { ...prev, questions: updated };
    });
  };

  // Modal: Edit Examination Details (Step 4)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Modal: Inspect Exam by ID (Step 3)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal: Quick Status Change (Step 5)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTargetExam, setStatusTargetExam] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState('scheduled');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Modal: Delete Examination (Step 6)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const showNotification = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  // Fetch Examinations with search, filter, and pagination (Step 2)
  const fetchExams = useCallback(async (pageOverride) => {
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
      if (statusFilter.trim()) params.status = statusFilter.trim();
      if (courseFilter.trim()) params.course = courseFilter.trim();

      const [examRes, courseRes] = await Promise.allSettled([
        examinationsApi.getAllExaminations(params),
        coursesApi.getAllCourses(),
      ]);

      if (examRes.status === 'fulfilled' && examRes.value.success) {
        setExams(examRes.value.data || []);
        if (examRes.value.pagination) {
          setPagination(examRes.value.pagination);
        }
      }
      if (courseRes.status === 'fulfilled' && courseRes.value.success) {
        setCourses(courseRes.value.data || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve examinations.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, pagination.page, pagination.limit, search, statusFilter, courseFilter, sortOption]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Step 1: Create Examination
  const handleCreateExam = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!createData.title.trim()) {
      setCreateError('Examination title is required.');
      return;
    }
    if (!createData.course) {
      setCreateError('Please select a target degree course.');
      return;
    }
    if (!createData.startDate || !createData.endDate) {
      setCreateError('Start date/time and end date/time are required.');
      return;
    }
    if (new Date(createData.endDate) <= new Date(createData.startDate)) {
      setCreateError('End date must be later than start date.');
      return;
    }

    if (!createData.questions || createData.questions.length === 0) {
      setCreateError('Please add at least one examination question.');
      return;
    }

    // Validate each question
    for (let i = 0; i < createData.questions.length; i++) {
      const q = createData.questions[i];
      if (!q.questionText.trim()) {
        setCreateError(`Question #${i + 1} statement is empty. Please enter the question text.`);
        return;
      }
      const validOptions = (q.options || []).map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        setCreateError(`Question #${i + 1} must have at least 2 non-empty options.`);
        return;
      }
      if (q.correctOptionIndex < 0 || q.correctOptionIndex >= validOptions.length) {
        setCreateError(`Please select a valid correct answer option for Question #${i + 1}.`);
        return;
      }
    }

    const formattedQuestions = createData.questions.map((q) => {
      const validOptions = q.options.map((o) => o.trim()).filter(Boolean);
      return {
        questionText: q.questionText.trim(),
        options: validOptions,
        correctOptionIndex: Number(q.correctOptionIndex) || 0,
        marks: Number(q.marks) || 1,
        negativeMarks: Number(q.negativeMarks) || 0,
        explanation: (q.explanation || '').trim(),
      };
    });

    const sumQuestionMarks = formattedQuestions.reduce((acc, q) => acc + q.marks, 0);
    const totalMarks = Number(createData.totalMarks) || sumQuestionMarks || 10;
    const passingMarks = Number(createData.passingMarks) || Math.ceil(totalMarks / 2);

    if (passingMarks > totalMarks) {
      setCreateError('Passing marks cannot exceed total marks.');
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        title: createData.title.trim(),
        description: createData.description.trim(),
        instructions: createData.instructions.trim() || '1. Read each question carefully.\n2. You must complete the test within the allocated duration.\n3. The exam will automatically submit when the timer expires.',
        course: createData.course,
        targetBatches: createData.targetBatches ? createData.targetBatches.split(',').map((b) => b.trim()).filter(Boolean) : [],
        startDate: new Date(createData.startDate).toISOString(),
        endDate: new Date(createData.endDate).toISOString(),
        durationMinutes: Number(createData.durationMinutes) || 30,
        totalMarks,
        passingMarks,
        negativeMarks: Number(createData.negativeMarks) || 0,
        maxAttempts: Number(createData.maxAttempts) || 1,
        status: createData.status || 'scheduled',
        isPublished: true,
        questions: formattedQuestions,
      };

      const res = await examinationsApi.createExamination(payload);
      if (res.success) {
        setShowCreateModal(false);
        showNotification(`Examination "${payload.title}" created with ${formattedQuestions.length} dynamic question(s).`);
        fetchExams(1);
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to schedule examination.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Step 3: Inspect Examination by ID
  const handleInspectExam = async (examId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const res = await examinationsApi.getExaminationById(examId);
      if (res.success) {
        setSelectedExamDetail(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load examination details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Step 4: Open & Submit Edit Modal
  const handleOpenEdit = (exam) => {
    setEditingExam({
      _id: exam._id,
      title: exam.title || '',
      description: exam.description || '',
      instructions: exam.instructions || '',
      durationMinutes: exam.durationMinutes || 60,
      totalMarks: exam.totalMarks || 20,
      passingMarks: exam.passingMarks || 10,
      negativeMarks: exam.negativeMarks !== undefined ? exam.negativeMarks : 1,
      maxAttempts: exam.maxAttempts || 2,
      resultPublicationDate: exam.resultPublicationDate ? exam.resultPublicationDate.substring(0, 10) : '',
      status: exam.status || 'scheduled',
      isPublished: exam.isPublished ?? true,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editingExam.title.trim()) {
      setEditError('Examination title cannot be empty.');
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        title: editingExam.title.trim(),
        description: editingExam.description.trim(),
        instructions: editingExam.instructions.trim(),
        durationMinutes: Number(editingExam.durationMinutes),
        totalMarks: Number(editingExam.totalMarks),
        passingMarks: Number(editingExam.passingMarks),
        negativeMarks: Number(editingExam.negativeMarks),
        maxAttempts: Number(editingExam.maxAttempts),
        status: editingExam.status,
        isPublished: editingExam.isPublished,
      };
      if (editingExam.resultPublicationDate) {
        payload.resultPublicationDate = new Date(editingExam.resultPublicationDate).toISOString();
      }

      const res = await examinationsApi.updateExamination(editingExam._id, payload);
      if (res.success) {
        setShowEditModal(false);
        showNotification('Examination updated successfully.');
        fetchExams();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update examination details.');
    } finally {
      setEditLoading(false);
    }
  };

  // Step 5: Update Examination Status
  const handleOpenStatusModal = (exam) => {
    setStatusTargetExam(exam);
    setSelectedNewStatus(exam.status || 'scheduled');
    setStatusError('');
    setShowStatusModal(true);
  };

  const handleSaveStatus = async () => {
    if (!statusTargetExam) return;
    setStatusLoading(true);
    setStatusError('');
    try {
      const res = await examinationsApi.updateExaminationStatus(statusTargetExam._id, selectedNewStatus);
      if (res.success) {
        setShowStatusModal(false);
        showNotification(`Status updated to "${selectedNewStatus}".`);
        fetchExams();
      }
    } catch (err) {
      setStatusError(err.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Step 6: Soft Delete Examination
  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await examinationsApi.deleteExamination(examToDelete._id);
      if (res.success) {
        setShowDeleteModal(false);
        setExamToDelete(null);
        showNotification('Examination deleted successfully.');
        fetchExams();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete examination.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Examination Management</h1>
          <p style={{ margin: 0 }}>
            Configure assessment schedules, question banks, and evaluation criteria.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
          <Lock size={42} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.75rem' }}>Administrator Authorization Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: '1.7' }}>
            The <code>/api/v1/examinations</code> endpoint enforces administrator authorization (<code>protectAdmin</code>). All question banks, exam schedules, and status controls require administrator credentials in Backend v1.
          </p>
          <Link to="/login/admin" className="btn btn-primary">
            Authenticate as Administrator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Examination Governance</h1>
          <p style={{ margin: 0 }}>
            Schedule proctored assessments, configure negative marking, publish results, and govern question banks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Schedule New Examination</span>
        </button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className="alert alert-success" style={{ margin: 0 }}>
          <CheckCircle2 size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ margin: 0 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Step 2 Query Controls: Search, Filters & Sorters */}
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
          {/* Search */}
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
              placeholder="Search by assessment title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Course Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="-createdAt">Newest Created</option>
              <option value="createdAt">Oldest Created</option>
              <option value="-startDate">Upcoming Start</option>
              <option value="startDate">Earliest Start</option>
              <option value="title">Title (A-Z)</option>
              <option value="-title">Title (Z-A)</option>
              <option value="totalMarks">Total Marks</option>
            </select>
          </div>

          {/* Reset button */}
          {(search || statusFilter || courseFilter || sortOption !== '-createdAt') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCourseFilter('');
                setSortOption('-createdAt');
              }}
              className="btn btn-secondary btn-sm"
              title="Reset query filters"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Counter Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>
            Showing <strong>{exams.length}</strong> of <strong>{pagination.total || exams.length}</strong> examinations
          </span>
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
        </div>
      </div>

      {/* Examinations List */}
      {loading ? (
        <LoadingSpinner fullPage text="Retrieving examinations from server database..." />
      ) : exams.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {exams.map((ex) => {
            const statusUpper = (ex.status || 'scheduled').toUpperCase();
            return (
              <div key={ex._id} className="card card-hover" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                      <Badge
                        variant={
                          ex.status === 'live' || ex.status === 'ongoing'
                            ? 'success'
                            : ex.status === 'published'
                            ? 'neutral'
                            : ex.status === 'cancelled'
                            ? 'review'
                            : 'info'
                        }
                      >
                        {statusUpper}
                      </Badge>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Course: <strong>{ex.course?.code || ex.course?.name || 'MCA'}</strong> • Batches: {ex.targetBatches?.join(', ') || '2026-2027'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                      {ex.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {ex.description || 'Proctored examination assessment module.'}
                    </p>
                  </div>

                  {/* Primary CTA: Question Bank */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link
                      to={`/teacher/examinations/${ex._id}/questions`}
                      className="btn btn-primary btn-sm"
                    >
                      <HelpCircle size={14} />
                      <span>Manage Question Bank ({ex.totalQuestions || ex.questions?.length || 0})</span>
                    </Link>
                  </div>
                </div>

                {/* Param Pills */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.825rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Start Window:</span>
                    <div style={{ fontWeight: 600 }}>
                      {ex.startDate ? new Date(ex.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Flexible'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>End Window:</span>
                    <div style={{ fontWeight: 600 }}>
                      {ex.endDate ? new Date(ex.endDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Flexible'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                    <div style={{ fontWeight: 600 }}>{ex.durationMinutes} Mins</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Marks:</span>
                    <div style={{ fontWeight: 600 }}>{ex.totalMarks} Marks</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Passing Criteria:</span>
                    <div style={{ fontWeight: 600 }}>{ex.passingMarks} Marks</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Penalty / Wrong:</span>
                    <div style={{ fontWeight: 600, color: ex.negativeMarks > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {ex.negativeMarks > 0 ? `-${ex.negativeMarks} Marks` : '0'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Max Attempts:</span>
                    <div style={{ fontWeight: 600 }}>{ex.maxAttempts || 1}</div>
                  </div>
                </div>

                {/* Administrative Controls Toolbar: Strictly Preview, Edit, Delete */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed var(--border-subtle)',
                  }}
                >
                  <a
                    href={`/teacher/examinations/${ex._id}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Preview Examination & Questions in New Tab"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </a>

                  <button
                    onClick={() => handleOpenEdit(ex)}
                    className="btn btn-secondary btn-sm"
                    title="Edit Examination Configuration & Status"
                  >
                    <Edit3 size={14} />
                    <span>Edit Exam</span>
                  </button>

                  <button
                    onClick={() => {
                      setExamToDelete(ex);
                      setShowDeleteModal(true);
                    }}
                    className="btn btn-danger btn-sm"
                    style={{ marginLeft: 'auto' }}
                    title="Delete Examination"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No examinations created"
          description="Click 'Schedule New Examination' above to create one."
        />
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchExams(pagination.page - 1)}
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
            onClick={() => fetchExams(pagination.page + 1)}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Step 1 Modal: Schedule New Examination */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Schedule New Examination (Dynamic Question Bank)"
          maxWidth="840px"
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
                onClick={handleCreateExam}
                className="btn btn-primary"
                disabled={createLoading}
              >
                {createLoading ? 'Scheduling...' : `Create Examination (${createData.questions.length} Questions)`}
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

          <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Examination Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Node.js Backend Assessment"
                value={createData.title}
                onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="Assessment overview and objectives..."
                value={createData.description}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Degree Course <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select
                  className="form-select"
                  value={createData.course}
                  onChange={(e) => handleCourseChangeInCreate(e.target.value)}
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Cohorts / Batches</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2026, 2027"
                  value={createData.targetBatches}
                  onChange={(e) => setCreateData({ ...createData, targetBatches: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Start Window Date & Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={createData.startDate}
                  onChange={(e) => setCreateData({ ...createData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">End Window Date & Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={createData.endDate}
                  onChange={(e) => setCreateData({ ...createData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Duration (Mins) *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={createData.durationMinutes}
                  onChange={(e) => setCreateData({ ...createData, durationMinutes: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Total Marks *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={createData.totalMarks}
                  onChange={(e) => setCreateData({ ...createData, totalMarks: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Passing Marks *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={createData.passingMarks}
                  onChange={(e) => setCreateData({ ...createData, passingMarks: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Negative Penalty</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="form-input"
                  value={createData.negativeMarks}
                  onChange={(e) => setCreateData({ ...createData, negativeMarks: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Max Attempts</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={createData.maxAttempts}
                  onChange={(e) => setCreateData({ ...createData, maxAttempts: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={createData.status}
                  onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Dynamic Question Bank Section */}
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HelpCircle size={18} color="var(--primary)" />
                    <span>Dynamic Question Bank ({createData.questions.length})</span>
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Add questions, configure options, and select the radio button for the correct answer.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddQuestion}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={14} />
                  <span>Add Question</span>
                </button>
              </div>

              {createData.questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                        }}
                      >
                        Question #{qIdx + 1}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}>
                        <label style={{ color: 'var(--text-muted)' }}>Marks:</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          className="form-input"
                          style={{ width: '65px', padding: '0.25rem 0.5rem', height: '32px' }}
                          value={q.marks}
                          onChange={(e) => handleQuestionFieldChange(qIdx, 'marks', e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}>
                        <label style={{ color: 'var(--text-muted)' }}>Penalty:</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          className="form-input"
                          style={{ width: '65px', padding: '0.25rem 0.5rem', height: '32px' }}
                          value={q.negativeMarks}
                          onChange={(e) => handleQuestionFieldChange(qIdx, 'negativeMarks', e.target.value)}
                        />
                      </div>

                      {createData.questions.length > 1 && (
                        <button
                          type="button"
                          className="action-icon-btn danger"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          title="Delete this question"
                          style={{ width: '30px', height: '30px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>
                      Question Statement <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      placeholder={`Enter statement for Question #${qIdx + 1}...`}
                      value={q.questionText}
                      onChange={(e) => handleQuestionFieldChange(qIdx, 'questionText', e.target.value)}
                      required
                    />
                  </div>

                  {/* Multiple Choice Options List */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', margin: 0 }}>
                        Multiple Choice Options:
                      </label>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddOption(qIdx)}
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: '26px' }}
                      >
                        <Plus size={12} /> Add Option
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctOptionIndex === optIdx;
                        const optionLetter = String.fromCharCode(65 + optIdx);
                        return (
                          <div
                            key={optIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.3rem 0.65rem',
                              backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.08)' : '#ffffff',
                              borderRadius: '8px',
                              border: `1px solid ${isCorrect ? 'var(--success, #10b981)' : 'var(--border-subtle)'}`,
                            }}
                          >
                            <input
                              type="radio"
                              name={`correct-opt-${qIdx}`}
                              id={`correct-opt-${qIdx}-${optIdx}`}
                              checked={isCorrect}
                              onChange={() => handleQuestionFieldChange(qIdx, 'correctOptionIndex', optIdx)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--success, #10b981)' }}
                              title="Select as correct answer key"
                            />
                            <label
                              htmlFor={`correct-opt-${qIdx}-${optIdx}`}
                              style={{
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                minWidth: '22px',
                                color: isCorrect ? 'var(--success)' : 'var(--text-secondary)',
                              }}
                            >
                              {optionLetter}.
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                padding: '0.3rem 0.4rem',
                                fontSize: '0.9rem',
                                boxShadow: 'none',
                              }}
                              placeholder={`Option ${optionLetter} text statement...`}
                              value={opt}
                              onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                              required
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                className="action-icon-btn danger"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                title="Remove this option"
                                style={{ width: '24px', height: '24px', padding: 0 }}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Explanation / Solution Notes (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Solution derivation or reference..."
                      value={q.explanation}
                      onChange={(e) => handleQuestionFieldChange(qIdx, 'explanation', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {/* Add Question Button */}
              <button
                type="button"
                onClick={handleAddQuestion}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Plus size={16} />
                <span>Add Another Dynamic Question</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Step 3 Modal: View Examination Specification */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Examination Specification Details"
        maxWidth="640px"
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
        {detailLoading || !selectedExamDetail ? (
          <LoadingSpinner text="Retrieving examination specifications..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0' }}>{selectedExamDetail.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Course: {selectedExamDetail.course?.name} ({selectedExamDetail.course?.code})
                </span>
              </div>
              <Badge variant="info">
                {selectedExamDetail.status?.toUpperCase()}
              </Badge>
            </div>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              <strong>MongoDB ObjectId:</strong> <code>{selectedExamDetail._id}</code>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }}>
              {selectedExamDetail.description || 'No description provided.'}
            </p>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Instructions:</span>
              <span>{selectedExamDetail.instructions || 'Answer all questions within the given time.'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>Duration: <strong>{selectedExamDetail.durationMinutes} Minutes</strong></div>
              <div>Total Marks: <strong>{selectedExamDetail.totalMarks} Marks</strong></div>
              <div>Passing Marks: <strong>{selectedExamDetail.passingMarks} Marks</strong></div>
              <div>Penalty: <strong>-{selectedExamDetail.negativeMarks || 0} Marks</strong></div>
              <div>Total Questions: <strong>{selectedExamDetail.totalQuestions || selectedExamDetail.questions?.length || 0}</strong></div>
              <div>Max Attempts: <strong>{selectedExamDetail.maxAttempts || 1}</strong></div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* Step 4 Modal: Update Examination Details */}
      {/* ========================================================================= */}
      {editingExam && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit Examination: ${editingExam.title}`}
          maxWidth="640px"
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
                onClick={handleUpdateExam}
                className="btn btn-primary"
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
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

          <form onSubmit={handleUpdateExam}>
            <div className="form-group">
              <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                className="form-input"
                value={editingExam.title}
                onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={editingExam.description}
                onChange={(e) => setEditingExam({ ...editingExam, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instructions</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={editingExam.instructions}
                onChange={(e) => setEditingExam({ ...editingExam, instructions: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Duration (Mins)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingExam.durationMinutes}
                  onChange={(e) => setEditingExam({ ...editingExam, durationMinutes: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingExam.totalMarks}
                  onChange={(e) => setEditingExam({ ...editingExam, totalMarks: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Passing Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingExam.passingMarks}
                  onChange={(e) => setEditingExam({ ...editingExam, passingMarks: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Negative Penalty</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={editingExam.negativeMarks}
                  onChange={(e) => setEditingExam({ ...editingExam, negativeMarks: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Attempts</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingExam.maxAttempts}
                  onChange={(e) => setEditingExam({ ...editingExam, maxAttempts: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Result Publication Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editingExam.resultPublicationDate}
                  onChange={(e) => setEditingExam({ ...editingExam, resultPublicationDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editingExam.status}
                  onChange={(e) => setEditingExam({ ...editingExam, status: e.target.value })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Step 5 Modal: Update Examination Status */}
      {/* ========================================================================= */}
      {statusTargetExam && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={`Update Status: ${statusTargetExam.title}`}
          maxWidth="460px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="btn btn-primary"
                disabled={statusLoading}
              >
                {statusLoading ? 'Updating...' : 'Apply Status'}
              </button>
            </div>
          }
        >
          {statusError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{statusError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Lifecycle Status</label>
            <select
              className="form-select"
              value={selectedNewStatus}
              onChange={(e) => setSelectedNewStatus(e.target.value)}
            >
              <option value="scheduled">Scheduled (Default upcoming window)</option>
              <option value="live">Live (Active and open for student attempts)</option>
              <option value="ongoing">Ongoing (Evaluations running)</option>
              <option value="completed">Completed (Submissions closed)</option>
              <option value="published">Published (Results visible to students)</option>
              <option value="cancelled">Cancelled (Assessment revoked)</option>
            </select>
            <span className="form-hint" style={{ marginTop: '0.5rem', display: 'block' }}>
              Setting status to Live allows eligible students to begin their attempts immediately.
            </span>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Step 6 Modal: Confirm Delete Examination */}
      {/* ========================================================================= */}
      {examToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirm Delete Examination"
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
                {deleteLoading ? 'Deleting...' : 'Delete Examination'}
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

          <p style={{ margin: 0, fontSize: '0.925rem', lineHeight: '1.6' }}>
            Are you sure you want to soft-delete <strong>{examToDelete.title}</strong>?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            The examination will be marked as cancelled and unlinked from its course in MongoDB.
          </p>
        </Modal>
      )}
    </div>
  );
};
