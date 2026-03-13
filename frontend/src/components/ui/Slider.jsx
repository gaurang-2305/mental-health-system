// frontend/src/components/ui/Slider.jsx
import React from 'react';

const Slider = ({ label, value, onChange, min = 0, max = 10, step = 1, disabled = false }) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary, var(--text2))' }}>
            {label}
          </label>
        </div>
      )}
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '6px',
          borderRadius: '3px',
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}>
          {/* Fill */}
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--primary, #4f8ef7)',
            borderRadius: '3px',
            transition: 'width 0.1s',
          }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'relative',
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            height: '20px',
            margin: 0,
            padding: 0,
            outline: 'none',
          }}
        />
      </div>
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary, #4f8ef7);
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 2px 6px rgba(79,142,247,0.4);
        }
        input[type=range]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary, #4f8ef7);
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default Slider;