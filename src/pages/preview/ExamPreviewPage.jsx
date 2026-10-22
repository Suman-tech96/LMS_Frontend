import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { examinationsApi } from '../../api/examinationsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  Clock,
  Award,
  AlertCircle,
  Printer,
  X,
  HelpCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const ExamPreviewPage = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examinationsApi.getExaminationById(id);
        if (res.success && res.data) {
          setExam(res.data);
        } else {
          throw new Error('Examination record not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load examination preview.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExam();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <LoadingSpinner fullPage text="Loading examination parameters & question bank..." />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Unable to Preview Examination</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{error || 'Examination record could not be found.'}</p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button onClick={handleClose} className="btn btn-secondary">
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Top Control Bar (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
              Official Examination Assessment & Question Bank
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              title="Print Examination / Save as PDF"
            >
              <Printer size={15} />
              <span>Print Assessment</span>
            </button>
            <button
              onClick={handleClose}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              title="Close this tab"
            >
              <X size={15} />
              <span>Close Tab</span>
            </button>
          </div>
        </div>

        {/* Exam Document Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  COURSE: {exam.course?.code || exam.course?.name || 'General'}
                </span>
                <Badge variant={exam.status === 'live' || exam.status === 'ongoing' ? 'success' : 'neutral'}>
                  {(exam.status || 'scheduled').toUpperCase()}
                </Badge>
              </div>
              <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2.25rem', fontWeight: 800, color: '#ffffff' }}>
                {exam.title}
              </h1>
              <p style={{ margin: 0, color: '#c7d2fe', fontSize: '1rem', maxWidth: '750px', lineHeight: 1.5 }}>
                {exam.description || 'Proctored academic examination module.'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>Target Cohorts</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                {exam.targetBatches?.join(', ') || 'All Batches'}
              </div>
            </div>
          </div>

          {/* Assessment Parameters Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              padding: '1.5rem 2.5rem',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Duration:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{exam.durationMinutes} Minutes</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Marks:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{exam.totalMarks} Marks</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Passing Threshold:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{exam.passingMarks} Marks</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Negative Penalty:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: exam.negativeMarks > 0 ? '#ef4444' : '#64748b' }}>
                {exam.negativeMarks > 0 ? `-${exam.negativeMarks} Marks` : 'None'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Allowed Attempts:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{exam.maxAttempts || 1}</div>
            </div>
          </div>

          {/* Questions Body */}
          <div style={{ padding: '2.5rem' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} color="#6366f1" /> Question Bank Items ({exam.questions?.length || 0})
            </h2>

            {exam.questions && exam.questions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {exam.questions.map((q, idx) => (
                  <div
                    key={q._id || idx}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: '#4338ca', fontSize: '0.9rem' }}>
                        Question {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {q.marks || 1} Mark{(q.marks || 1) > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                      {q.questionText}
                    </div>

                    {/* Options */}
                    {q.options && q.options.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctOption === optIdx || q.correctAnswer === opt;
                          return (
                            <div
                              key={optIdx}
                              style={{
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: isCorrect ? '2px solid #10b981' : '1px solid #e2e8f0',
                                backgroundColor: isCorrect ? '#ecfdf5' : '#ffffff',
                                color: isCorrect ? '#065f46' : '#334155',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <strong style={{ minWidth: '20px' }}>{String.fromCharCode(65 + optIdx)}.</strong>
                              <span>{opt}</span>
                              {isCorrect && (
                                <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                No questions added to this examination yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
