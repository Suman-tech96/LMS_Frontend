import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { examinationsApi } from '../../api/examinationsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ExamTimer } from '../../components/examination/ExamTimer';
import { QuestionPalette } from '../../components/examination/QuestionPalette';
import { SubmitConfirmModal } from '../../components/examination/SubmitConfirmModal';
import { Badge } from '../../components/common/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Bookmark,
  Award,
} from 'lucide-react';

export const ExaminationAttemptPage = () => {
  const { id } = useParams();

  // Core Attempt Data
  const [participation, setParticipation] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [reviews, setReviews] = useState({}); // { [questionId]: boolean }
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);

  // UI state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingStatus, setSavingStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Start or resume attempt on mount
  useEffect(() => {
    let isMounted = true;

    const initAttempt = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examinationsApi.startExamAttempt(id);
        if (res.success && isMounted) {
          const { participation: part, questions: qList, answers: existingAnswers, timeRemainingSeconds: sec } = res.data;
          setParticipation(part);
          setQuestions(qList || []);
          setTimeRemainingSeconds(sec || 3600);

          // Populate existing answers if resumed
          const answerMap = {};
          const reviewMap = {};
          if (Array.isArray(existingAnswers)) {
            existingAnswers.forEach((ans) => {
              if (ans.questionId) {
                answerMap[ans.questionId] = ans.selectedOptionIndex;
                if (ans.isMarkedForReview) {
                  reviewMap[ans.questionId] = true;
                }
              }
            });
          }
          setAnswers(answerMap);
          setReviews(reviewMap);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to start examination. Please verify eligibility.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAttempt();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle single question auto-save
  const saveAnswerToServer = async (qId, optionIdx, isReview) => {
    setSavingStatus('saving');
    try {
      await examinationsApi.saveStudentAnswer(id, {
        questionId: qId,
        selectedOptionIndex: optionIdx,
        isMarkedForReview: isReview,
      });
      setSavingStatus('saved');
    } catch (err) {
      console.warn('Failed to auto-save answer:', err.message);
      setSavingStatus('error');
    }
  };

  const handleSelectOption = (optionIndex) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex]._id;

    const newAnswers = { ...answers, [qId]: optionIndex };
    setAnswers(newAnswers);

    saveAnswerToServer(qId, optionIndex, !!reviews[qId]);
  };

  const handleClearOption = () => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex]._id;

    const newAnswers = { ...answers, [qId]: null };
    setAnswers(newAnswers);

    saveAnswerToServer(qId, null, !!reviews[qId]);
  };

  const handleToggleReview = () => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex]._id;

    const newReviews = { ...reviews, [qId]: !reviews[qId] };
    setReviews(newReviews);

    saveAnswerToServer(qId, answers[qId] ?? null, !reviews[qId]);
  };

  // Submit attempt
  const handleSubmitExam = useCallback(async (isAuto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Build answers payload: [{ questionId, selectedOptionIndex }]
      const answersPayload = questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: answers[q._id] !== undefined ? answers[q._id] : null,
      }));

      const res = await examinationsApi.submitExamAttempt(id, {
        answers: answersPayload,
        isAutoSubmitted: isAuto,
      });

      if (res.success && res.data) {
        setSubmissionResult(res.data);
      }
    } catch (err) {
      alert(`Submission error: ${err.message || 'Unable to submit exam'}`);
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  }, [answers, id, isSubmitting, questions]);

  // Auto-submit on timer expiry
  const handleTimeExpired = useCallback(() => {
    if (!submissionResult && !isSubmitting) {
      handleSubmitExam(true);
    }
  }, [submissionResult, isSubmitting, handleSubmitExam]);

  if (loading) {
    return <LoadingSpinner fullPage text="Initializing secure examination session..." />;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <AlertTriangle size={36} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>Examination Unavailable</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>{error}</p>
          <Link to="/student/examinations" className="btn btn-secondary">
            Return to Examination Timetable
          </Link>
        </div>
      </div>
    );
  }

  // If already submitted and showing result breakdown
  if (submissionResult) {
    const { breakdown, examinationTitle, isAutoSubmitted } = submissionResult;
    return (
      <div style={{ maxWidth: '750px', margin: '2rem auto' }}>
        <div className="card" style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Examination Completed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            {examinationTitle || 'Assessment'}{' '}
            {isAutoSubmitted && <span className="badge badge-warning">(Auto-Submitted on Timeout)</span>}
          </p>

          {breakdown ? (
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                border: '1px solid var(--border-subtle)',
                marginBottom: '2rem',
                textAlign: 'left',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                Session Performance Summary
              </h3>

              <div className="grid grid-cols-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score Obtained</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                    {breakdown.obtainedMarks} / {breakdown.totalMarks}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Percentage</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: breakdown.isPassed ? 'var(--success)' : 'var(--danger)' }}>
                    {breakdown.percentage}%
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Result Status</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: breakdown.isPassed ? 'var(--success)' : 'var(--danger)' }}>
                    {breakdown.isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Questions:</span>
                  <strong>{breakdown.totalQuestions}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Attempted:</span>
                  <strong style={{ color: 'var(--success)' }}>{breakdown.totalAttempted}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Correct Answers:</span>
                  <strong style={{ color: 'var(--success)' }}>{breakdown.totalCorrect}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Incorrect Answers:</span>
                  <strong style={{ color: 'var(--danger)' }}>{breakdown.totalWrong}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Positive Marks:</span>
                  <strong>+{breakdown.positiveMarks}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Negative Deductions:</span>
                  <strong style={{ color: 'var(--danger)' }}>-{breakdown.negativeMarksDeducted}</strong>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Your examination has been recorded and submitted for evaluation. Official results will appear in your Results tab once published.
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/student/results" className="btn btn-primary btn-lg">
              <Award size={18} />
              <span>Go to Published Results</span>
            </Link>
            <Link to="/student/dashboard" className="btn btn-secondary btn-lg">
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || null;
  const currentQId = currentQ?._id;
  const currentAnswer = answers[currentQId];
  const isCurrentMarkedReview = !!reviews[currentQId];

  // Count summaries
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== null && answers[k] !== undefined
  ).length;
  const reviewCount = Object.keys(reviews).filter((k) => reviews[k] === true).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Exam Header Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            Attempt #{participation?.attemptNumber || 1}
          </div>
          <span className="badge badge-info">Active Evaluation</span>

          {/* Saving Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            {savingStatus === 'saving' && (
              <span style={{ color: 'var(--accent)' }}>Saving to server...</span>
            )}
            {savingStatus === 'saved' && (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Saved
              </span>
            )}
            {savingStatus === 'error' && (
              <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={13} /> Retrying save...
              </span>
            )}
          </div>
        </div>

        {/* Timer & Submit CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ExamTimer
            initialSeconds={timeRemainingSeconds}
            onTimeExpired={handleTimeExpired}
          />
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-primary"
          >
            <Send size={16} />
            <span>Submit Exam</span>
          </button>
        </div>
      </div>

      {/* Main Examination Viewport: Question Card (Left) + Palette (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '1.5rem',
          alignItems: 'flex-start',
        }}
        className="exam-viewport-grid"
      >
        {/* Question Pane */}
        {currentQ ? (
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
            {/* Question Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                {isCurrentMarkedReview && (
                  <Badge variant="review">
                    <Bookmark size={12} /> Marked for Review
                  </Badge>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Marks: <strong style={{ color: 'var(--text-primary)' }}>{currentQ.marks || 1}</strong>
                {currentQ.negativeMarks > 0 && (
                  <span style={{ color: 'var(--danger)', marginLeft: '6px' }}>
                    (-{currentQ.negativeMarks})
                  </span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: '1.6',
                marginBottom: '2rem',
              }}
            >
              {currentQ.questionText}
            </h3>

            {/* Multiple Choice Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {currentQ.options &&
                currentQ.options.map((option, oIdx) => {
                  const isSelected = currentAnswer === oIdx;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected
                          ? 'var(--primary-container)'
                          : 'var(--bg-tertiary)',
                        border: isSelected
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isSelected
                            ? '6px solid var(--primary-light)'
                            : '2px solid var(--text-muted)',
                          backgroundColor: isSelected ? 'var(--bg-primary)' : 'transparent',
                          flexShrink: 0,
                          transition: 'all var(--transition-fast)',
                        }}
                      />
                      <span style={{ fontSize: '0.95rem', color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                        {option}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Question Controls */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`btn ${isCurrentMarkedReview ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  title="Flag for later review"
                >
                  <Bookmark size={15} />
                  <span>{isCurrentMarkedReview ? 'Remove Review Flag' : 'Mark for Review'}</span>
                </button>

                {currentAnswer !== null && currentAnswer !== undefined && (
                  <button
                    type="button"
                    onClick={handleClearOption}
                    className="btn btn-secondary btn-sm"
                    title="Clear selected option"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                  disabled={currentIndex === 0}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((idx) => Math.min(totalQuestions - 1, idx + 1))}
                    className="btn btn-primary"
                  >
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <Send size={16} />
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="No questions loaded" description="Please verify examination setup." />
        )}

        {/* Sidebar Question Palette */}
        <QuestionPalette
          questions={questions}
          answers={answers}
          reviews={reviews}
          currentIndex={currentIndex}
          onSelectQuestion={(idx) => setCurrentIndex(idx)}
        />
      </div>

      {/* Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={() => handleSubmitExam(false)}
        isSubmitting={isSubmitting}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        reviewCount={reviewCount}
      />

      <style>{`
        @media (max-width: 900px) {
          .exam-viewport-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
