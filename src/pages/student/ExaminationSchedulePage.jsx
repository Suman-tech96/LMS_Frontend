import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examinationsApi } from '../../api/examinationsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  Award,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  Eye,
} from 'lucide-react';

export const ExaminationSchedulePage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Result Modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultExamTitle, setResultExamTitle] = useState('');
  const [resultData, setResultData] = useState(null);
  const [resultMessage, setResultMessage] = useState('');
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState('');

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await examinationsApi.getStudentAvailableExams();
      if (res.success) {
        setExams(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve examination schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCheckResult = async (exam) => {
    setResultExamTitle(exam.title || 'Examination Result');
    setShowResultModal(true);
    setResultLoading(true);
    setResultError('');
    setResultData(null);
    setResultMessage('');
    try {
      const res = await examinationsApi.getStudentExamResult(exam._id);
      if (res.success) {
        setResultData(res.data);
        setResultMessage(res.message || '');
      }
    } catch (err) {
      if (exam.latestResult) {
        setResultData(exam.latestResult);
      } else {
        setResultError(err.message || 'Unable to retrieve examination result.');
      }
    } finally {
      setResultLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving verified examination timetable..." />;
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return 'TBA';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="exam-schedule-header">
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', marginBottom: '0.35rem' }}>Examination Schedule</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Scheduled assessments, eligibility status, and attempt limits for your course and batch.
          </p>
        </div>
        <button onClick={fetchExams} className="btn btn-secondary btn-sm" title="Refresh schedule">
          <RotateCcw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
          <button onClick={fetchExams} className="btn btn-secondary btn-sm">
            Retry
          </button>
        </div>
      )}

      {exams.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          {exams.map((exam) => {
            const attemptsUsed = exam.completedAttemptsCount || 0;
            const maxAttempts = exam.maxAttempts || 1;
            const hasAttemptsRemaining = attemptsUsed < maxAttempts;
            const canTakeAgain = hasAttemptsRemaining && (exam.canAttempt || exam.lifecycleStatus !== 'Cancelled');
            const isLive = exam.lifecycleStatus === 'Live' || exam.hasActiveAttempt || exam.canAttempt;

            let statusVariant = 'neutral';
            let statusLabel = exam.lifecycleStatus || 'Scheduled';

            if (exam.hasActiveAttempt) {
              statusVariant = 'review';
              statusLabel = 'Active Attempt in Progress';
            } else if (canTakeAgain && attemptsUsed > 0) {
              statusVariant = 'warning';
              statusLabel = `Attempt ${attemptsUsed + 1} Available (${attemptsUsed}/${maxAttempts} Used)`;
            } else if (exam.canAttempt) {
              statusVariant = 'success';
              statusLabel = 'Available Now';
            } else if (attemptsUsed >= maxAttempts) {
              statusVariant = 'neutral';
              statusLabel = 'Maximum Attempts Reached';
            }

            return (
              <div
                key={exam._id}
                className="card card-hover exam-item-card"
                style={{
                  borderLeft: isLive || canTakeAgain ? '4px solid var(--primary)' : '1px solid var(--border-subtle)',
                }}
              >
                {/* Header & Action Controls */}
                <div className="exam-card-header">
                  <div className="exam-card-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                      <Badge variant={statusVariant}>
                        {statusLabel}
                      </Badge>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Course: <strong>{exam.course?.code || exam.course?.name || 'Academic Assessment'}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.45rem)', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      {exam.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {exam.description || 'Comprehensive evaluation covering course syllabus and learning objectives.'}
                    </p>
                  </div>

                  {/* Top Action Buttons (Responsive on mobile) */}
                  <div className="exam-card-actions">
                    {/* Active In-Progress Attempt */}
                    {exam.hasActiveAttempt && (
                      <Link to={`/student/examinations/${exam._id}/attempt`} className="btn btn-primary exam-main-action-btn">
                        <Clock size={16} />
                        <span>Resume In-Progress Exam</span>
                        <ArrowRight size={16} />
                      </Link>
                    )}

                    {/* Fresh Attempt (First time) */}
                    {!exam.hasActiveAttempt && attemptsUsed === 0 && exam.canAttempt && (
                      <Link to={`/student/examinations/${exam._id}/instructions`} className="btn btn-primary exam-main-action-btn">
                        <span>Read Instructions & Start</span>
                        <ArrowRight size={16} />
                      </Link>
                    )}

                    {/* Retake Attempt Button (Display until maximum attempts reached) */}
                    {!exam.hasActiveAttempt && attemptsUsed > 0 && canTakeAgain && (
                      <Link
                        to={`/student/examinations/${exam._id}/instructions`}
                        className="btn btn-primary exam-main-action-btn"
                        title={`Take exam again (${attemptsUsed} of ${maxAttempts} attempts used)`}
                      >
                        <RotateCcw size={16} style={{ flexShrink: 0 }} />
                        <span>Take Test Again (Attempt {attemptsUsed + 1} of {maxAttempts})</span>
                        <ArrowRight size={16} style={{ flexShrink: 0 }} />
                      </Link>
                    )}

                    {/* Maximum Attempts Reached Indicator */}
                    {!exam.hasActiveAttempt && attemptsUsed >= maxAttempts && (
                      <span className="exam-limit-reached-badge">
                        <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                        <span>Attempts Reached ({attemptsUsed}/{maxAttempts})</span>
                      </span>
                    )}

                    {/* Secondary Result Actions */}
                    {attemptsUsed > 0 && (
                      <div className="exam-secondary-actions">
                        <button
                          type="button"
                          onClick={() => handleCheckResult(exam)}
                          className="btn btn-secondary btn-sm"
                          title="View evaluation scorecard and solution report"
                        >
                          <Eye size={15} />
                          <span>Check Result</span>
                        </button>
                        <Link to="/student/results" className="btn btn-outline btn-sm">
                          <Award size={15} />
                          <span>Transcripts</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* ALWAYS DISPLAY LAST EXAM RESULT (If any attempt taken)     */}
                {/* ========================================================= */}
                {exam.latestResult ? (
                  <div
                    className="exam-result-banner"
                    style={{
                      backgroundColor: exam.latestResult.isPassed ? 'rgba(45, 122, 77, 0.07)' : 'rgba(184, 50, 48, 0.07)',
                      border: `1px solid ${exam.latestResult.isPassed ? 'var(--success-border)' : 'var(--danger-border)'}`,
                    }}
                  >
                    {/* Result Header Bar */}
                    <div className="exam-result-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: exam.latestResult.isPassed ? 'var(--success-bg)' : 'var(--danger-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Award size={15} color={exam.latestResult.isPassed ? 'var(--success)' : 'var(--danger)'} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          Latest Exam Result
                          {exam.latestResult.participation?.attemptNumber
                            ? ` (Attempt #${exam.latestResult.participation.attemptNumber})`
                            : attemptsUsed > 1 ? ` (Last Attempt of ${attemptsUsed})` : ''}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: exam.latestResult.isPassed ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: exam.latestResult.isPassed ? 'var(--success)' : 'var(--danger)',
                            border: `1px solid ${exam.latestResult.isPassed ? 'var(--success-border)' : 'var(--danger-border)'}`,
                          }}
                        >
                          {exam.latestResult.isPassed ? 'PASSED' : 'NEEDS WORK'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCheckResult(exam)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                        }}
                      >
                        <Eye size={13} />
                        <span>View Analysis Modal</span>
                      </button>
                    </div>

                    {/* Result Metrics Grid (Responsive 4-col -> 2-col) */}
                    <div className="exam-result-metrics-grid">
                      <div className="metric-box">
                        <span className="metric-label">Score Obtained</span>
                        <span className="metric-value">
                          {exam.latestResult.obtainedMarks}{' '}
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                            / {exam.totalMarks || exam.latestResult.totalMarks}
                          </span>
                        </span>
                      </div>

                      <div className="metric-box">
                        <span className="metric-label">Percentage</span>
                        <span className="metric-value" style={{ color: exam.latestResult.isPassed ? 'var(--success)' : 'var(--danger)' }}>
                          {exam.latestResult.percentage}%
                        </span>
                      </div>

                      <div className="metric-box">
                        <span className="metric-label">Accuracy</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                          <span style={{ color: 'var(--success)' }}>{exam.latestResult.totalCorrect || 0} Correct</span>
                          {' • '}
                          <span style={{ color: 'var(--danger)' }}>{exam.latestResult.totalWrong || 0} Wrong</span>
                        </span>
                      </div>

                      <div className="metric-box">
                        <span className="metric-label">Submitted On</span>
                        <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
                          {formatDateTime(exam.latestResult.createdAt || exam.latestResult.participation?.submitTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : attemptsUsed > 0 ? (
                  <div className="exam-recorded-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Last exam attempt recorded ({attemptsUsed} of {maxAttempts} completed).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCheckResult(exam)}
                      className="btn btn-secondary btn-sm exam-recorded-btn"
                    >
                      <Eye size={14} />
                      <span>Check Scorecard</span>
                    </button>
                  </div>
                ) : null}

                {/* Exam Details Grid (Responsive 6-col -> 3-col -> 2-col) */}
                <div className="exam-details-grid">
                  <div>
                    <span className="detail-label">Start Window:</span>
                    <strong className="detail-value">{formatDateTime(exam.startDate)}</strong>
                  </div>

                  <div>
                    <span className="detail-label">End Window:</span>
                    <strong className="detail-value">{formatDateTime(exam.endDate)}</strong>
                  </div>

                  <div>
                    <span className="detail-label">Duration:</span>
                    <strong className="detail-value">{exam.durationMinutes} Minutes</strong>
                  </div>

                  <div>
                    <span className="detail-label">Marks / Passing:</span>
                    <strong className="detail-value">
                      {exam.totalMarks} / {exam.passingMarks} Marks
                    </strong>
                  </div>

                  <div>
                    <span className="detail-label">Attempts (Used / Max):</span>
                    <strong className="detail-value">
                      {attemptsUsed} of {maxAttempts}
                    </strong>
                  </div>

                  <div>
                    <span className="detail-label">Negative Marking:</span>
                    <strong className="detail-value" style={{ color: exam.negativeMarks > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {exam.negativeMarks > 0 ? `-${exam.negativeMarks} Marks` : 'None'}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No examinations currently scheduled"
          description="Your course coordinator has not scheduled any active assessments for your enrolled batch."
        />
      )}

      {/* ========================================================================= */}
      {/* Detailed Result Breakdown Modal                                           */}
      {/* ========================================================================= */}
      {showResultModal && (
        <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title={`Examination Result: ${resultExamTitle}`}
          maxWidth="580px"
          footer={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowResultModal(false)}
              style={{ width: '100%' }}
            >
              Close
            </button>
          }
        >
          {resultLoading ? (
            <LoadingSpinner text="Querying evaluation results from server..." />
          ) : resultError ? (
            <div className="alert alert-danger">
              <AlertCircle size={16} />
              <span>{resultError}</span>
            </div>
          ) : resultData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <Award
                  size={36}
                  color={resultData.isPassed ? 'var(--success)' : 'var(--primary)'}
                  style={{ marginBottom: '0.5rem' }}
                />
                <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>
                  {resultData.examinationTitle || resultExamTitle}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {resultData.status || resultMessage || 'Result recorded and evaluated'}
                </p>
              </div>

              {resultData.obtainedMarks !== undefined && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.65rem', textAlign: 'center' }}>
                    <div className="card" style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Score</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                        {resultData.obtainedMarks} / {resultData.totalMarks}
                      </div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Percentage</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: resultData.isPassed ? 'var(--success)' : 'var(--danger)' }}>
                        {resultData.percentage}%
                      </div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Status</span>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: resultData.isPassed ? 'var(--success)' : 'var(--danger)' }}>
                        {resultData.isPassed ? 'PASSED' : 'NEEDS WORK'}
                      </div>
                    </div>
                  </div>

                  {/* Breakdown details */}
                  <div
                    style={{
                      padding: '0.85rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                      gap: '0.5rem',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Correct</span>
                      <strong style={{ color: 'var(--success)', fontSize: '0.95rem' }}>{resultData.totalCorrect ?? '--'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Incorrect</span>
                      <strong style={{ color: 'var(--danger)', fontSize: '0.95rem' }}>{resultData.totalWrong ?? '--'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Unattempted</span>
                      <strong style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{resultData.totalUnattempted ?? '--'}</strong>
                    </div>
                    {resultData.grade && (
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Grade</span>
                        <strong style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>{resultData.grade}</strong>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {resultMessage || 'No evaluation result found for this examination attempt.'}
            </p>
          )}
        </Modal>
      )}

      {/* Scoped Responsive Stylesheet */}
      <style>{`
        .exam-schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.85rem;
        }
        .exam-item-card {
          padding: 1.5rem;
          box-sizing: border-box;
          max-width: 100%;
          overflow: hidden;
        }
        .exam-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          width: 100%;
        }
        .exam-card-info {
          flex: 1 1 260px;
          min-width: 0;
        }
        .exam-card-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .exam-main-action-btn {
          white-space: nowrap;
        }
        .exam-secondary-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .exam-limit-reached-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
        }
        .exam-result-banner {
          margin: 1.15rem 0;
          padding: 1rem 1.15rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-sizing: border-box;
          width: 100%;
          overflow: hidden;
        }
        .exam-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .exam-result-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          width: 100%;
          box-sizing: border-box;
        }
        .metric-box {
          background-color: #ffffff;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          min-width: 0;
          box-sizing: border-box;
        }
        .metric-label {
          font-size: 0.725rem;
          color: var(--text-muted);
          display: block;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .metric-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
        }
        .exam-recorded-banner {
          margin: 1.15rem 0;
          padding: 0.85rem 1rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          width: 100%;
          box-sizing: border-box;
        }
        .exam-details-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1rem;
          padding: 1rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          font-size: 0.85rem;
          width: 100%;
          box-sizing: border-box;
        }
        .detail-label {
          color: var(--text-muted);
          display: block;
          margin-bottom: 2px;
          font-size: 0.75rem;
        }
        .detail-value {
          color: var(--text-primary);
          display: block;
          font-size: 0.825rem;
          word-break: break-word;
        }

        /* Tablet Breakpoint (<= 1024px) */
        @media (max-width: 1024px) {
          .exam-details-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.85rem;
          }
          .exam-result-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Mobile Breakpoint (<= 640px) */
        @media (max-width: 640px) {
          .exam-item-card {
            padding: 1.1rem 0.95rem !important;
          }
          .exam-card-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.85rem !important;
            margin-bottom: 0.85rem !important;
          }
          .exam-card-info {
            width: 100% !important;
          }
          .exam-card-actions {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
          }
          .exam-main-action-btn {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            white-space: normal !important;
            text-align: center !important;
            justify-content: center !important;
            padding: 0.65rem 0.75rem !important;
            font-size: 0.875rem !important;
            word-break: break-word !important;
          }
          .exam-limit-reached-badge {
            width: 100% !important;
            box-sizing: border-box !important;
            justify-content: center !important;
            text-align: center !important;
            font-size: 0.8rem !important;
          }
          .exam-secondary-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .exam-secondary-actions .btn {
            width: 100% !important;
            font-size: 0.8rem !important;
            padding: 0.55rem 0.5rem !important;
            text-align: center !important;
            justify-content: center !important;
            white-space: normal !important;
            box-sizing: border-box !important;
          }
          .exam-result-banner {
            padding: 0.85rem 0.85rem !important;
            margin: 0.9rem 0 !important;
          }
          .exam-result-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.4rem !important;
          }
          .exam-result-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }
          .exam-recorded-banner {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.65rem !important;
            padding: 0.85rem !important;
          }
          .exam-recorded-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .exam-details-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.65rem !important;
            padding: 0.75rem !important;
          }
        }

        /* Tiny Mobile Screen Breakpoint (<= 380px) */
        @media (max-width: 380px) {
          .exam-secondary-actions {
            grid-template-columns: 1fr !important;
          }
          .exam-details-grid {
            grid-template-columns: 1fr !important;
          }
          .exam-result-metrics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
