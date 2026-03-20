import React, { useState } from 'react';

const baseStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1.5px solid rgba(160,120,80,0.24)',
  background: 'rgba(255,252,248,0.9)',
  color: '#2c1f12',
  fontSize: '13.5px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  boxSizing: 'border-box',
  fontFamily: "'Outfit', sans-serif",
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
        <label style={{
          display: 'block', marginBottom: '6px',
          fontSize: '10.5px', fontWeight: 700,
          color: '#7a5c44', textTransform: 'uppercase',
          letterSpacing: '0.7px', fontFamily: "'Outfit', sans-serif",
        }}>
          {label}
          {required && <span style={{ color: '#b84a4a', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: '12px',
            color: '#c4a882', fontSize: '13px', pointerEvents: 'none',
          }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...baseStyle,
            borderColor: error
              ? 'rgba(184,74,74,0.5)'
              : focused
              ? 'rgba(160,120,80,0.6)'
              : 'rgba(160,120,80,0.24)',
            boxShadow: focused
              ? '0 0 0 3px rgba(160,120,80,0.1)'
              : error
              ? '0 0 0 3px rgba(184,74,74,0.08)'
              : 'none',
            background: focused ? '#fff' : 'rgba(255,252,248,0.9)',
            paddingLeft: prefix ? '36px' : '14px',
            paddingRight: suffix ? '36px' : '14px',
            ...style,
          }}
          {...rest}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: '12px',
            color: '#c4a882', fontSize: '13px', pointerEvents: 'none',
          }}>
            {suffix}
          </span>
        )}
      </div>
      {error && <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#b84a4a', fontFamily: "'Outfit', sans-serif" }}>{error}</p>}
      {hint && !error && <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>{hint}</p>}
    </div>
  );
};

export const Select = ({
  label, error, hint, children,
  className = '', style = {}, containerStyle = {}, required, ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px', ...containerStyle }}>
      {label && (
        <label style={{
          display: 'block', marginBottom: '6px',
          fontSize: '10.5px', fontWeight: 700,
          color: '#7a5c44', textTransform: 'uppercase',
          letterSpacing: '0.7px', fontFamily: "'Outfit', sans-serif",
        }}>
          {label}
          {required && <span style={{ color: '#b84a4a', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <select
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseStyle,
          borderColor: error
            ? 'rgba(184,74,74,0.5)'
            : focused
            ? 'rgba(160,120,80,0.6)'
            : 'rgba(160,120,80,0.24)',
          boxShadow: focused ? '0 0 0 3px rgba(160,120,80,0.1)' : 'none',
          background: focused ? '#fff' : 'rgba(255,252,248,0.9)',
          cursor: 'pointer',
          ...style,
        }}
        {...rest}
      >
        {children}
      </select>
      {error && <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#b84a4a', fontFamily: "'Outfit', sans-serif" }}>{error}</p>}
      {hint && !error && <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>{hint}</p>}
    </div>
  );
};

export const Textarea = ({
  label, error, hint, rows = 4,
  className = '', style = {}, containerStyle = {}, required, ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px', ...containerStyle }}>
      {label && (
        <label style={{
          display: 'block', marginBottom: '6px',
          fontSize: '10.5px', fontWeight: 700,
          color: '#7a5c44', textTransform: 'uppercase',
          letterSpacing: '0.7px', fontFamily: "'Outfit', sans-serif",
        }}>
          {label}
          {required && <span style={{ color: '#b84a4a', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseStyle,
          resize: 'vertical',
          minHeight: `${rows * 26}px`,
          borderColor: error
            ? 'rgba(184,74,74,0.5)'
            : focused
            ? 'rgba(160,120,80,0.6)'
            : 'rgba(160,120,80,0.24)',
          boxShadow: focused ? '0 0 0 3px rgba(160,120,80,0.1)' : 'none',
          background: focused ? '#fff' : 'rgba(255,252,248,0.9)',
          ...style,
        }}
        {...rest}
      />
      {error && <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#b84a4a', fontFamily: "'Outfit', sans-serif" }}>{error}</p>}
      {hint && !error && <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>{hint}</p>}
    </div>
  );
};

export default Input;