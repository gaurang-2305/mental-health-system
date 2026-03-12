import React from 'react';
import { CHART_COLORS } from '../../utils/constants';

const AcademicChart = ({ data = [], height = 200 }) => {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '14px' }}>
        No academic data available yet.
      </div>
    );
  }

  const chartData = [...data].sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at)).slice(-10);
  const maxScore = 100;

  const getGradeColor = (score) => {
    if (score >= 80) return CHART_COLORS.success;
    if (score >= 60) return CHART_COLORS.primary;
    if (score >= 40) return CHART_COLORS.warning;
    return CHART_COLORS.danger;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Line chart simulation with bars */}
      <div style={{ position: 'relative', height: `${height}px`, padding: '0 4px' }}>
        {/* Grid lines */}
        {[25, 50, 75].map((pct) => (
          <div
            key={pct}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${100 - pct}%`,
              borderTop: '1px dashed rgba(255,255,255,0.06)',
              zIndex: 0,
            }}
          />
        ))}

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100%', position: 'relative', zIndex: 1 }}>
          {chartData.map((entry, idx) => {
            const score = parseFloat(entry.score || entry.grade || 0);
            const pct = (score / maxScore) * 100;
            const color = getGradeColor(score);

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
                title={`${entry.subject || 'Subject'}: ${score}%`}
              >
                <span style={{ fontSize: '10px', color, fontWeight: 700 }}>{score}%</span>
                <div
                  style={{
                    width: '100%',
                    height: `${pct}%`,
                    minHeight: '4px',
                    background: `linear-gradient(to top, ${color}, ${color}66)`,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease',
                    boxShadow: `0 0 10px ${color}33`,
                  }}
                />
                <div
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                  title={entry.subject}
                >
                  {entry.subject || `#${idx + 1}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        {[
          { label: 'A (80+)', color: CHART_COLORS.success },
          { label: 'B (60-80)', color: CHART_COLORS.primary },
          { label: 'C (40-60)', color: CHART_COLORS.warning },
          { label: 'D (<40)', color: CHART_COLORS.danger },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicChart;