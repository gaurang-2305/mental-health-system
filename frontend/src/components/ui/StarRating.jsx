// frontend/src/components/ui/StarRating.jsx
import React from 'react';

const StarRating = ({ value, onChange, size = 28, readOnly = false }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readOnly && onChange && onChange(star)}
        disabled={readOnly}
        style={{
          background: 'none',
          border: 'none',
          cursor: readOnly ? 'default' : 'pointer',
          padding: '2px',
          fontSize: size,
          lineHeight: 1,
          transition: 'transform 0.1s',
          transform: star <= value ? 'scale(1.1)' : 'scale(1)',
          filter: star <= value ? 'none' : 'grayscale(1) opacity(0.35)',
          outline: 'none',
        }}
        aria-label={`${star} star${star !== 1 ? 's' : ''}`}
      >
        ⭐
      </button>
    ))}
  </div>
);

export default StarRating;