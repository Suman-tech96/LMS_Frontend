import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { resultsApi } from '../../api/resultsApi';
import { coursesApi } from '../../api/coursesApi';
import { examinationsApi } from '../../api/examinationsApi';
import { studentsApi } from '../../api/studentsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  AlertCircle,
  RotateCcw,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  BookOpen,
  User,
  Check,
  X,
  FileText,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherResultsPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  // --- Results List & Pagination (Step 1) ---
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // --- Filter & Sorting States (Step 1 Query Parameters) ---
  const [examinationFilter, setExaminationFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');

  // --- Reference Data for Filter Dropdowns ---
  const [coursesList, setCoursesList] = useState([]);
  const [examsList, setExamsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  // --- Modal: Step 2 (Get Result by ID & Detailed Answer Breakdown) ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailedResult, setDetailedResult] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Flash Notification Helper
  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Load Reference Filters Data
  useEffect(() => {
    if (!isAdmin) return;
    const loadReferences = async () => {
      try {
        const [cRes, eRes, sRes] = await Promise.allSettled([
          coursesApi.getAllCourses({ limit: 100 }),
          examinationsApi.getAllExaminations({ limit: 100 }),
          studentsApi.getAllStudents({ limit: 100 }),
        ]);

        if (cRes.status === 'fulfilled' && cRes.value.data) setCoursesList(cRes.value.data);
        if (eRes.status === 'fulfilled' && eRes.value.data) setExamsList(eRes.value.data);
        if (sRes.status === 'fulfilled' && sRes.value.data) setStudentsList(sRes.value.data);
      } catch (err) {
        console.warn('Could not load filter reference lists:', err.message);
      }
    };
    loadReferences();
  }, [isAdmin]);

  // Fetch Results with all Step 1 Query Parameters
  const fetchResults = useCallback(async (pageOverride) => {
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

      if (examinationFilter) params.examination = examinationFilter;
      if (studentFilter) params.student = studentFilter;
      if (courseFilter) params.course = courseFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await resultsApi.getAllResults(params);
      if (res.success) {
        setResults(res.data || []);
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
      setError(err.message || 'Unable to retrieve examination results.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, pagination.page, pagination.limit, sortOption, examinationFilter, studentFilter, courseFilter, statusFilter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Filter Form Submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchResults(1);
  };

  const handleResetFilters = () => {
    setExaminationFilter('');
    setStudentFilter('');
    setCourseFilter('');
    setStatusFilter('');
    setSortOption('-createdAt');
    fetchResults(1);
  };

  // ----------------------------------------------------
  // Step 2: Get Result by ID Handler
  // ----------------------------------------------------
  const handleViewResultDetails = async (id) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailError('');
    try {
      const res = await resultsApi.getResultById(id);
      if (res.success && res.data) {
        setDetailedResult(res.data);
      }
    } catch (err) {
      setDetailError(err.message || 'Unable to retrieve result details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // ----------------------------------------------------
  // Steps 3 & 4: Publish / Unpublish Result Handlers
  // ----------------------------------------------------
  const handleTogglePublish = async (resItem) => {
    setActionLoadingId(resItem._id);
    try {
      if (resItem.status === 'published') {
        const res = await resultsApi.unpublishResult(resItem._id);
        triggerSuccess(res.message || 'Result successfully unpublished from student view.');
      } else {
        const res = await resultsApi.publishResult(resItem._id);
        triggerSuccess(res.message || 'Result successfully published to student view!');
      }

      // If viewing in detail modal, refresh detailed object
      if (detailedResult && detailedResult._id === resItem._id) {
        const updated = await resultsApi.getResultById(resItem._id);
        if (updated.data) setDetailedResult(updated.data);
      }

      fetchResults();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Format Date Helper
  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString();
  };

  // Unauthorized State
  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Result Management Portal</h1>
          <p style={{ margin: 0 }}>
            Audit candidate evaluations, verify scorecard metrics, and publish official grades.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
          <Lock size={42} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.75rem' }}>Administrator Authorization Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: '1.7' }}>
            The <code>/api/v1/results</code> endpoint and its publication controls require an active administrator session (<code>protectAdmin</code>).
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem', fontWeight: 800 }}>Result Management</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Review candidate attempt evaluations, inspect individual answer sheets, and publish official marks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => fetchResults()}
            className="btn btn-secondary"
            title="Refresh results list"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
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

      {/* Filter and Search Bar (Step 1 Query Parameters) */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {/* Examination Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Examination</label>
              <select
                className="form-input"
                value={examinationFilter}
                onChange={(e) => setExaminationFilter(e.target.value)}
              >
                <option value="">All Examinations</option>
                {examsList.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Course</label>
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

            {/* Student Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Student</label>
              <select
                className="form-input"
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
              >
                <option value="">All Students</option>
                {studentsList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.studentId} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Status Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Publication Status</label>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All (Published & Unpublished)</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished / Draft</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Sort By</label>
              <select
                className="form-input"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="-createdAt">Newest Evaluation (-createdAt)</option>
                <option value="createdAt">Oldest Evaluation (createdAt)</option>
                <option value="-obtainedMarks">Score (Highest First)</option>
                <option value="obtainedMarks">Score (Lowest First)</option>
                <option value="-percentage">Percentage (Highest First)</option>
                <option value="percentage">Percentage (Lowest First)</option>
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

      {/* Main Results Table */}
      {loading ? (
        <LoadingSpinner fullPage text="Retrieving platform evaluation transcripts..." />
      ) : results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Examination</th>
                  <th>Course</th>
                  <th>Score & %</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const isPub = r.status === 'published';
                  const isItemLoading = actionLoadingId === r._id;

                  return (
                    <tr key={r._id}>
                      <td>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{r.student?.name || 'Student'}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {r.student?.email || 'N/A'}
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
                          {r.student?.studentId || 'N/A'}
                        </code>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{r.examination?.title || 'Assessment'}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Passing: {r.examination?.passingMarks || 0} / Total: {r.totalMarks}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{r.course?.name || r.course?.code || 'N/A'}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Batch: {r.batch || '2026-2027'}
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>
                            {r.obtainedMarks} / {r.totalMarks}
                          </strong>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: r.isPassed ? 'var(--success)' : 'var(--danger)' }}>
                            {r.percentage}% • {r.isPassed ? 'PASSED' : 'FAILED'} (Grade: {r.grade || 'N/A'})
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={isPub ? 'success' : 'warning'}>
                          {isPub ? 'Published' : 'Unpublished'}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {/* Step 2: View Full Breakdown */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewResultDetails(r._id)}
                            title="View Detailed Answer Sheet & Metrics (Step 2)"
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          {/* Steps 3 & 4: Publish / Unpublish Toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(r)}
                            disabled={isItemLoading}
                            className={`btn ${isPub ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            title={isPub ? 'Unpublish Result from Student Portal (Step 4)' : 'Publish Result to Student Portal (Step 3)'}
                          >
                            {isItemLoading ? (
                              'Updating...'
                            ) : isPub ? (
                              <span>Unpublish</span>
                            ) : (
                              <span>Publish</span>
                            )}
                          </button>
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
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total evaluated results)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchResults(pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchResults(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No evaluation results found"
          description={examinationFilter || studentFilter || courseFilter || statusFilter ? "No results match your active query filters. Try resetting the filters." : "Submitted candidate examinations will appear here automatically for grading inspection and publication."}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: Detailed Result Breakdown (Step 2 - GET /api/v1/results/:id)       */}
      {/* ========================================================================= */}
      {showDetailModal && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Detailed Candidate Scorecard & Evaluation (Step 2)"
          maxWidth="840px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              {detailedResult && (
                <button
                  type="button"
                  onClick={() => handleTogglePublish(detailedResult)}
                  disabled={actionLoadingId === detailedResult._id}
                  className={`btn ${detailedResult.status === 'published' ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {actionLoadingId === detailedResult._id
                    ? 'Updating Status...'
                    : detailedResult.status === 'published'
                    ? 'Unpublish Result (Step 4)'
                    : 'Publish Result to Student (Step 3)'}
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
                style={{ marginLeft: 'auto' }}
              >
                Close
              </button>
            </div>
          }
        >
          {detailLoading ? (
            <LoadingSpinner text="Retrieving detailed candidate examination submission..." />
          ) : detailError ? (
            <div className="alert alert-danger">{detailError}</div>
          ) : detailedResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Header Box */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>
                    {detailedResult.examination?.title || 'Examination Assessment'}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Candidate: <strong>{detailedResult.student?.name}</strong> (<code>{detailedResult.student?.studentId}</code>) • Batch: {detailedResult.batch}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge variant={detailedResult.status === 'published' ? 'success' : 'warning'}>
                    {detailedResult.status === 'published' ? 'Published' : 'Unpublished'}
                  </Badge>
                  <Badge variant={detailedResult.isPassed ? 'success' : 'danger'}>
                    {detailedResult.isPassed ? 'PASSED' : 'FAILED'} (Grade: {detailedResult.grade || 'N/A'})
                  </Badge>
                </div>
              </div>

              {/* Score Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Final Score</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                    {detailedResult.obtainedMarks} / {detailedResult.totalMarks}
                  </div>
                </div>

                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Percentage</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: detailedResult.isPassed ? 'var(--success)' : 'var(--danger)' }}>
                    {detailedResult.percentage}%
                  </div>
                </div>

                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Correct Answers</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                    {detailedResult.totalCorrect} / {detailedResult.totalQuestions}
                  </div>
                </div>

                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wrong / Unattempted</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>
                    {detailedResult.totalWrong} / {detailedResult.totalUnattempted}
                  </div>
                </div>

                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Penalty Deducted</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: detailedResult.negativeMarksDeducted > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    -{detailedResult.negativeMarksDeducted}
                  </div>
                </div>
              </div>

              {/* Timing & Participation Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Course: </span>
                  <strong>{detailedResult.course?.name} ({detailedResult.course?.code})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Duration Used: </span>
                  <strong>{detailedResult.participation?.durationUsedMinutes ?? 'N/A'} Minutes</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Exam Start Time: </span>
                  <span>{formatDate(detailedResult.participation?.startTime)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Exam Submit Time: </span>
                  <span>{formatDate(detailedResult.participation?.submitTime)}</span>
                </div>
              </div>

              {/* Detailed Questions & Candidate Answers Breakdown */}
              {detailedResult.participation?.answers && detailedResult.examination?.questions && (
                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Candidate Question-by-Question Response Audit ({detailedResult.participation.answers.length} Questions)
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {detailedResult.examination.questions.map((q, idx) => {
                      const ans = detailedResult.participation.answers.find(
                        (a) => a.questionId?.toString() === q._id?.toString()
                      );

                      const isAttempted = ans?.isAttempted;
                      const isCorrect = ans?.isCorrect;
                      const selectedOptIdx = ans?.selectedOptionIndex;

                      return (
                        <div
                          key={q._id || idx}
                          style={{
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.03)' : isAttempted ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-tertiary)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                            <strong style={{ fontSize: '0.9rem' }}>
                              Q{idx + 1}. {q.questionText}
                            </strong>
                            <div>
                              {isCorrect ? (
                                <Badge variant="success">+{ans.marksAwarded} Marks</Badge>
                              ) : isAttempted ? (
                                <Badge variant="danger">
                                  {ans.marksAwarded < 0 ? `${ans.marksAwarded} Penalty` : '0 Marks'}
                                </Badge>
                              ) : (
                                <Badge variant="neutral">Unattempted</Badge>
                              )}
                            </div>
                          </div>

                          {/* Options breakdown */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.35rem', marginTop: '0.5rem' }}>
                            {q.options?.map((opt, optIdx) => {
                              const isSelected = selectedOptIdx === optIdx;
                              const isCorrectOpt = q.correctOptionIndex === optIdx;

                              let optBorder = 'var(--border-subtle)';
                              let optBg = 'transparent';
                              let optText = 'inherit';

                              if (isCorrectOpt) {
                                optBorder = 'var(--success)';
                                optBg = 'rgba(16, 185, 129, 0.1)';
                                optText = 'var(--success)';
                              } else if (isSelected && !isCorrectOpt) {
                                optBorder = 'var(--danger)';
                                optBg = 'rgba(239, 68, 68, 0.1)';
                                optText = 'var(--danger)';
                              }

                              return (
                                <div
                                  key={optIdx}
                                  style={{
                                    fontSize: '0.8rem',
                                    padding: '0.35rem 0.6rem',
                                    borderRadius: '4px',
                                    border: `1px solid ${optBorder}`,
                                    background: optBg,
                                    color: optText,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <span>
                                    <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                                  </span>
                                  {isSelected && (
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.5rem' }}>
                                      (Candidate Choice)
                                    </span>
                                  )}
                                  {isCorrectOpt && !isSelected && (
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.5rem' }}>
                                      (Correct Answer)
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.45rem', fontStyle: 'italic' }}>
                              Explanation: {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="alert alert-danger">Unable to load result.</div>
          )}
        </Modal>
      )}
    </div>
  );
};
