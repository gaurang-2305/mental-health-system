import React from 'react';
import { getMoodColor, formatDate } from '../../utils/helpers';

const MoodChart = ({ data = [], height = 200, showLabels = true }) => {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '14px' }}>
        No mood data available yet.
      </div>
    );
  }

  const maxVal = 10;
  const minVal = 0;
  const chartData = data.slice(-14).reverse();
  const width = 100 / chartData.length;

  return (
    <div style={{ width: '100%' }}>
      {/* Bar chart */}
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
          const score = entry.mood_score || entry.score || 0;
          const pct = ((score - minVal) / (maxVal - minVal)) * 100;
          const color = getMoodColor(score);

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
              title={`${formatDate(entry.created_at || entry.date)}: ${score}/10`}
            >
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {score}
              </span>
              <div
                style={{
                  width: '100%',
                  height: `${pct}%`,
                  minHeight: '4px',
                  background: `linear-gradient(to top, ${color}cc, ${color}66)`,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease',
                  boxShadow: `0 0 8px ${color}44`,
                }}
              />
              {showLabels && (
                <span
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    transform: 'rotate(-45deg)',
                    whiteSpace: 'nowrap',
                    transformOrigin: 'center',
                    marginBottom: '2px',
                  }}
                >
                  {new Date(entry.created_at || entry.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Y-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '0 4px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>😢 Low</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>😊 High</span>
      </div>
    </div>
  );
};

export default MoodChart;