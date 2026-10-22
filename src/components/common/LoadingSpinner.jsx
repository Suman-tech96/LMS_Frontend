import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md', fullPage = false }) => {
  const spinnerStyle = {
    sm: { width: '18px', height: '18px', borderWidth: '2px' },
    md: { width: '28px', height: '28px', borderWidth: '3px' },
    lg: { width: '42px', height: '42px', borderWidth: '4px' },
  }[size] || { width: '28px', height: '28px', borderWidth: '3px' };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.5rem' }}>
      <div className="spinner" style={spinnerStyle} />
      {text && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{text}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
};
