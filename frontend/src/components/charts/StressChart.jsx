import React from 'react';
import { RISK_COLORS } from '../../utils/constants';
import { getRiskLevel } from '../../utils/helpers';

const StressChart = ({ data = [], height = 200, showGauge = false, currentScore = null }) => {
  if (showGauge && currentScore !== null) {
    return <StressGauge score={currentScore} />;
  }

  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '14px' }}>
        No stress data available yet.
      </div>
    );
  }

  const chartData = data.slice(-14).reverse();

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          height: `${height}px`,
          padding: '0 4px',
        }}
      >
        {chartData.map((entry, idx) => {
          const score = entry.score || entry.computed_stress || entry.stress_score || 0;
          const risk = getRiskLevel(score);
          const color = RISK_COLORS[risk];
          const pct = (score / 100) * 100;

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
                gap: '4px',
              }}
              title={`${entry.created_at?.split('T')[0]}: ${score} (${risk})`}
            >
              <span style={{ fontSize: '10px', color, fontWeight: 700 }}>{score}</span>
              <div
                style={{
                  width: '100%',
                  height: `${pct}%`,
                  minHeight: '4px',
                  background: `linear-gradient(to top, ${color}cc, ${color}55)`,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease',
                }}
              />
              <span
                style={{
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                }}
              >
                {new Date(entry.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Risk zones legend */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StressGauge = ({ score }) => {
  const risk = getRiskLevel(score);
  const color = RISK_COLORS[risk];
  const angle = (score / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ position: 'relative', width: '180px', height: '100px', margin: '0 auto' }}>
        {/* Gauge arc background */}
        <svg width="180" height="100" viewBox="0 0 180 100">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="33%" stopColor="#fbbf24" />
              <stop offset="66%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d="M 15 90 A 75 75 0 0 1 165 90"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 15 90 A 75 75 0 0 1 165 90"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 236} 236`}
          />
          {/* Needle */}
          <line
            x1="90"
            y1="90"
            x2={90 + 60 * Math.cos((angle * Math.PI) / 180)}
            y2={90 - 60 * Math.sin(((angle + 90) * Math.PI) / 180)}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="90" cy="90" r="5" fill={color} />
        </svg>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color, marginTop: '8px' }}>{score}</div>
      <div
        style={{
          fontSize: '13px',
          color,
          fontWeight: 600,
          textTransform: 'capitalize',
          background: `${color}22`,
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '999px',
          marginTop: '4px',
        }}
      >
        {risk} Risk
      </div>
    </div>
  );
};

export default StressChart;