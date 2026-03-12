import React, { useState } from 'react';

const baseInputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export const Input = ({
  label,
  error,
  hint,
  type = 'text',
  prefix,
  suffix,
  className = '',
  style = {},
  containerStyle = {},
  required,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px', ...containerStyle }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
          {required && <span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
              fontSize: '14px',
              pointerEvents: 'none',
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...baseInputStyle,
            borderColor: error
              ? '#f87171'
              : focused
              ? 'var(--primary)'
              : 'var(--border)',
            paddingLeft: prefix ? '36px' : '14px',
            paddingRight: suffix ? '36px' : '14px',
            ...style,
          }}
          {...rest}
        />
        {suffix && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              color: 'var(--text-muted)',
              fontSize: '14px',
              pointerEvents: 'none',
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#f87171' }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</p>
      )}
    </div>
  );
};

export const Select = ({
  label,
  error,
  hint,
  children,
  className = '',
  style = {},
  containerStyle = {},
  required,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px', ...containerStyle }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
          {required && <span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <select
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseInputStyle,
          borderColor: error ? '#f87171' : focused ? 'var(--primary)' : 'var(--border)',
          cursor: 'pointer',
          ...style,
        }}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#f87171' }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</p>
      )}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  hint,
  rows = 4,
  className = '',
  style = {},
  containerStyle = {},
  required,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px', ...containerStyle }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
          {required && <span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseInputStyle,
          resize: 'vertical',
          minHeight: `${rows * 24}px`,
          borderColor: error ? '#f87171' : focused ? 'var(--primary)' : 'var(--border)',
          ...style,
        }}
        {...rest}
      />
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#f87171' }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</p>
      )}
    </div>
  );
};

export default Input;