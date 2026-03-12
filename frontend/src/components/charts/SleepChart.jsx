import React from 'react';

const SLEEP_COLORS = {
  good: '#34d399',
  ok: '#4f8ef7',
  poor: '#fbbf24',
  bad: '#f87171',
};

const getSleepColor = (hours) => {
  if (hours >= 8) return SLEEP_COLORS.good;
  if (hours >= 6) return SLEEP_COLORS.ok;
  if (hours >= 4) return SLEEP_COLORS.poor;
  return SLEEP_COLORS.bad;
};

const SleepChart = ({ data = [], height = 200 }) => {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '14px' }}>
        No sleep data available yet.
      </div>
    );
  }

  const chartData = data.slice(-14).reverse();
  const maxHours = 12;

  return (
    <div style={{ width: '100%' }}>
      {/* Recommended sleep line label */}
      <div style={{ position: 'relative', height: `${height}px`, padding: '0 4px' }}>
        {/* 8-hour reference line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${100 - (8 / maxHours) * 100}%`,
            borderTop: '1px dashed rgba(52,211,153,0.4)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 4,
            top: `${100 - (8 / maxHours) * 100}%`,
            fontSize: '9px',
            color: '#34d399',
            transform: 'translateY(-100%)',
          }}
        >
          Ideal (8h)
        </div>

        {/* Bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            height: '100%',
          }}
        >
          {chartData.map((entry, idx) => {
            const hours = parseFloat(entry.sleep_hours || entry.hours || 0);
            const pct = Math.min((hours / maxHours) * 100, 100);
            const color = getSleepColor(hours);

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
                title={`${entry.date || entry.created_at?.split('T')[0]}: ${hours}h sleep`}
              >
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {hours}h
                </span>
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
                  {new Date(entry.date || entry.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        {[
          { label: '≥8h Good', color: SLEEP_COLORS.good },
          { label: '6-8h OK', color: SLEEP_COLORS.ok },
          { label: '4-6h Poor', color: SLEEP_COLORS.poor },
          { label: '<4h Bad', color: SLEEP_COLORS.bad },
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

export default SleepChart;