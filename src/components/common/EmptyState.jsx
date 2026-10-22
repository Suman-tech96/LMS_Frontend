import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items available right now.',
  action = null,
}) => {
  const DisplayIcon = icon;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed var(--border-subtle)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-light)',
          marginBottom: '1rem',
        }}
      >
        <DisplayIcon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '420px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: action ? '1.25rem' : '0' }}>
        {description}
      </p>
      {action}
    </div>
  );
};
