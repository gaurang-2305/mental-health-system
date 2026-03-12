import React from 'react';
import { CHART_COLORS } from '../../utils/constants';

const ActivityChart = ({ data = [], height = 200, metric = 'exercise_duration' }) => {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '14px' }}>
        No activity data available yet.
      </div>
    );
  }

  const chartData = data.slice(-14).reverse();
  const maxVal = Math.max(...chartData.map((d) => parseFloat(d[metric] || 0)), 1);

  const metricConfig = {
    exercise_duration: { label: 'Exercise (min)', color: CHART_COLORS.success, unit: 'min' },
    water_intake: { label: 'Water (glasses)', color: CHART_COLORS.cyan, unit: 'gl' },
    diet_quality: { label: 'Diet Quality', color: CHART_COLORS.warning, unit: '/10', max: 10 },
  };
  const config = metricConfig[metric] || metricConfig.exercise_duration;

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
          const val = parseFloat(entry[metric] || 0);
          const pct = (val / maxVal) * 100;
          const color = config.color;

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
              title={`${entry.date || entry.created_at?.split('T')[0]}: ${val}${config.unit}`}
            >
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {val}
              </span>
              <div
                style={{
                  width: '100%',
                  height: `${pct}%`,
                  minHeight: val > 0 ? '4px' : '0',
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
                {new Date(entry.date || entry.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        {config.label} — Last {chartData.length} days
      </div>
    </div>
  );
};

export default ActivityChart;