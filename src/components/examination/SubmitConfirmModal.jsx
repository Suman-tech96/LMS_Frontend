import React from 'react';
import { Modal } from '../common/Modal';
import { AlertTriangle, Send } from 'lucide-react';

export const SubmitConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  totalQuestions = 0,
  answeredCount = 0,
  unansweredCount = 0,
  reviewCount = 0,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Submit Examination Confirmation"
      maxWidth="500px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Review Questions
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Submitting to Server...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Confirm & Submit</span>
              </>
            )}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="alert alert-warning" style={{ margin: 0 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Are you sure you want to finish and submit?</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Once submitted, your responses will be evaluated by the server. You will not be able to modify any answers.
            </p>
          </div>
        </div>

        {/* Breakdown table */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Questions</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {totalQuestions}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Answered</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>
                {answeredCount}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unanswered</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {unansweredCount}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Marked for Review</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c084fc' }}>
                {reviewCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
