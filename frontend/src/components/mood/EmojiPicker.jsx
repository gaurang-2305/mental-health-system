import React from 'react';
import { MOOD_EMOJIS } from '../../utils/constants';

const EmojiPicker = ({
  value,
  onChange,
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  const sizes = {
    sm: { emoji: '24px', gap: '6px', padding: '6px' },
    md: { emoji: '32px', gap: '8px', padding: '10px' },
    lg: { emoji: '42px', gap: '10px', padding: '12px' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: s.gap,
        justifyContent: 'center',
      }}
      role="group"
      aria-label="Select mood"
    >
      {MOOD_EMOJIS.map((mood) => {
        const isSelected = value === mood.value;
        return (
          <button
            key={mood.value}
            type="button"
            title={mood.label}
            aria-label={`${mood.label} (${mood.value}/10)`}
            aria-pressed={isSelected}
            onClick={() => onChange?.(mood.value)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: s.padding,
              borderRadius: '12px',
              border: isSelected
                ? '2px solid var(--primary)'
                : '2px solid transparent',
              background: isSelected
                ? 'rgba(79,142,247,0.15)'
                : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              transform: isSelected ? 'scale(1.12)' : 'scale(1)',
              boxShadow: isSelected ? '0 0 12px rgba(79,142,247,0.3)' : 'none',
            }}
          >
            <span style={{ fontSize: s.emoji, lineHeight: 1 }}>{mood.emoji}</span>
            {showLabels && (
              <span
                style={{
                  fontSize: '9px',
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isSelected ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {mood.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EmojiPicker;