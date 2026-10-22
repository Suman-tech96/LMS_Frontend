import React from 'react';
import { CheckCircle2, Bookmark, HelpCircle } from 'lucide-react';

export const QuestionPalette = ({
  questions = [],
  answers = {},
  reviews = {},
  currentIndex = 0,
  onSelectQuestion,
}) => {
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== null && answers[k] !== undefined
  ).length;
  const reviewCount = Object.keys(reviews).filter((k) => reviews[k] === true).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
        Question Palette
      </h4>

      {/* Grid of question buttons */}
      <div className="palette-grid" style={{ marginBottom: '1.5rem' }}>
        {questions.map((q, idx) => {
          const qId = q._id || idx;
          const isAnswered = answers[qId] !== null && answers[qId] !== undefined;
          const isMarkedReview = !!reviews[qId];
          const isCurrent = idx === currentIndex;

          let statusClass = 'unanswered';
          if (isMarkedReview) {
            statusClass = 'review';
          } else if (isAnswered) {
            statusClass = 'answered';
          }

          return (
            <button
              key={qId}
              type="button"
              className={`palette-btn ${statusClass} ${isCurrent ? 'current' : ''}`}
              onClick={() => onSelectQuestion(idx)}
              aria-label={`Jump to question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend & Summary */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.825rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: '#10b981',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Answered</span>
          </div>
          <strong style={{ color: '#10b981' }}>{answeredCount}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: '#9333ea',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Marked for Review</span>
          </div>
          <strong style={{ color: '#c084fc' }}>{reviewCount}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: '#1e293b',
                border: '1px solid var(--border-subtle)',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Unanswered</span>
          </div>
          <strong style={{ color: 'var(--text-muted)' }}>{unansweredCount}</strong>
        </div>
      </div>
    </div>
  );
};
