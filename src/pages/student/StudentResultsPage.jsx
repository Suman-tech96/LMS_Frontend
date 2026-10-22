import React, { useState, useEffect } from 'react';
import { resultsApi } from '../../api/resultsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  Download,
} from 'lucide-react';

export const StudentResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalResult, setActiveModalResult] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resultsApi.getStudentPublishedResults();
      if (res.success) {
        setResults(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve official examination results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleOpenTranscriptModal = async (resultId) => {
    setModalLoading(true);
    setModalError('');
    setActiveModalResult(true); // Open modal in loading state
    try {
      const res = await resultsApi.getStudentPublishedResultById(resultId);
      if (res.success && res.data) {
        setActiveModalResult(res.data);
      }
    } catch (err) {
      setModalError(err.message || 'Could not retrieve published transcript.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving verified academic results..." />;
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Official Published Results</h1>
        <p style={{ margin: 0 }}>
          Authenticated examination transcripts verified and published by the administration.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {results.map((res) => {
            const isPassed = res.isPassed;
            return (
              <div key={res._id} className="card card-hover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                      <Badge variant="success">Official Publication</Badge>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Published on {formatDateTime(res.publishedAt || res.updatedAt)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      {res.examination?.title || 'Course Examination'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                      Course: <strong>{res.course?.name || 'Master of Computer Applications'}</strong> ({res.batch || '2026-2027'})
                    </p>
                  </div>

                  {/* Score Pill */}
                  <div
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isPassed ? 'var(--success)' : 'var(--danger)' }}>
                      {res.obtainedMarks} / {res.totalMarks}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isPassed ? 'var(--success)' : 'var(--danger)' }}>
                      {res.percentage}% • {isPassed ? 'PASSED' : 'FAILED'} (Grade: {res.grade || 'N/A'})
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Questions:</span>
                    <div style={{ fontWeight: 600 }}>{res.totalQuestions}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Attempted:</span>
                    <div style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{res.totalAttempted}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Correct:</span>
                    <div style={{ fontWeight: 600, color: 'var(--success)' }}>{res.totalCorrect}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Incorrect:</span>
                    <div style={{ fontWeight: 600, color: 'var(--danger)' }}>{res.totalWrong}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Negative Penalty:</span>
                    <div style={{ fontWeight: 600, color: res.negativeMarksDeducted > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      -{res.negativeMarksDeducted}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenTranscriptModal(res._id)}
                    className="btn btn-secondary btn-sm"
                  >
                    <FileText size={14} />
                    <span>View Official Transcript Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No published examination results"
          description="Your examination results have not been published yet. Once the academic administration evaluates and releases your batch scores, they will appear here automatically."
        />
      )}

      {/* Official Scorecard Modal (Step 6 - GET /student/results/:id) */}
      {activeModalResult && (
        <Modal
          isOpen={!!activeModalResult}
          onClose={() => setActiveModalResult(null)}
          title="Official Academic Transcript"
          maxWidth="640px"
          footer={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveModalResult(null)}
            >
              Close
            </button>
          }
        >
          {modalLoading ? (
            <LoadingSpinner text="Retrieving authenticated examination transcript from registry..." />
          ) : modalError ? (
            <div className="alert alert-danger">{modalError}</div>
          ) : typeof activeModalResult === 'object' && activeModalResult._id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>
                  {activeModalResult.examination?.title || 'Academic Assessment'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Course: {activeModalResult.course?.name} ({activeModalResult.batch})
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className={`badge ${activeModalResult.isPassed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
                    Final Status: {activeModalResult.isPassed ? 'PASSED' : 'FAILED'} (Grade: {activeModalResult.grade || 'N/A'})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                  <strong>{activeModalResult.student?.name || 'Enrolled Student'}</strong>
                </div>
                {activeModalResult.student?.studentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Registration ID:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{activeModalResult.student?.studentId}</strong>
                  </div>
                )}
                {activeModalResult.participation?.durationUsedMinutes !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Duration Used:</span>
                    <strong>{activeModalResult.participation.durationUsedMinutes} Minutes</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Maximum Marks:</span>
                  <strong>{activeModalResult.totalMarks} Marks</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Passing Marks Required:</span>
                  <strong>{activeModalResult.examination?.passingMarks || 10} Marks</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Positive Marks Earned:</span>
                  <strong style={{ color: 'var(--success)' }}>+{activeModalResult.positiveMarks}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Negative Penalties:</span>
                  <strong style={{ color: 'var(--danger)' }}>-{activeModalResult.negativeMarksDeducted}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Final Marks Obtained:</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--primary-light)' }}>{activeModalResult.obtainedMarks}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Aggregate Percentage:</span>
                  <strong style={{ fontSize: '1.1rem' }}>{activeModalResult.percentage}%</strong>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
};
