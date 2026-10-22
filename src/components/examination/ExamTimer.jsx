import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export const ExamTimer = ({ initialSeconds = 0, onTimeExpired = () => {} }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const onTimeExpiredRef = useRef(onTimeExpired);
  const hasExpiredRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired;
  }, [onTimeExpired]);

  useEffect(() => {
    if (initialSeconds > 0) {
      setSecondsRemaining(initialSeconds);
      hasInitializedRef.current = true;
      hasExpiredRef.current = false;
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (!hasInitializedRef.current || secondsRemaining <= 0) {
      if (hasInitializedRef.current && secondsRemaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onTimeExpiredRef.current();
      }
      return;
    }

    const timerId = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onTimeExpiredRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsRemaining]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSecs) => {
    const safeSecs = Math.max(0, totalSecs || 0);
    const hours = Math.floor(safeSecs / 3600);
    const minutes = Math.floor((safeSecs % 3600) / 60);
    const seconds = safeSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isUrgent = secondsRemaining < 300; // Under 5 minutes

  return (
    <div
      className={`timer-pill ${isUrgent ? 'urgent' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.4rem 0.85rem',
        borderRadius: '20px',
        backgroundColor: isUrgent ? '#fef2f2' : 'var(--bg-tertiary, #f1f5f9)',
        color: isUrgent ? '#dc2626' : 'var(--text-primary)',
        border: `1px solid ${isUrgent ? '#fca5a5' : 'var(--border-subtle, #cbd5e1)'}`,
        fontWeight: 700,
        fontSize: '0.95rem',
        letterSpacing: '0.05em',
        fontVariantNumeric: 'tabular-nums',
      }}
      title="Remaining examination time"
    >
      {isUrgent ? <AlertCircle size={17} color="#dc2626" /> : <Clock size={17} color="var(--primary)" />}
      <span>{formatTime(secondsRemaining)}</span>
    </div>
  );
};
