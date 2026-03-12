import React from 'react';
import RiskBadge from '../crisis/RiskBadge';
import CrisisBanner from '../crisis/CrisisBanner';
import { RISK_COLORS } from '../../utils/constants';

const SurveyResults = ({ result, onRetake, onBookAppointment }) => {
  if (!result) return null;

  const { computed_stress, risk_level, mood_score, stress_score, anxiety_score, sleep_hours } = result;
  const color = RISK_COLORS[risk_level] || '#4f8ef7';

  const recommendations = {
    low: [
      '✅ Great job maintaining your mental wellness!',
      '🧘 Continue your mindfulness practices.',
      '💪 Keep up your physical activity routine.',
      '💤 Maintain your sleep schedule.',
    ],
    moderate: [
      '⚠️ Consider adding relaxation techniques to your day.',
      '🚶 A 20-minute walk can significantly reduce stress.',
      '📝 Try journaling to process your feelings.',
      '💬 Reach out to a friend or counselor if needed.',
    ],
    high: [
      '🔴 Please prioritize your mental health today.',
      '📅 We strongly recommend booking a counselor session.',
      '🧘 Try the 4-7-8 breathing exercise right now.',
      '📱 Consider calling iCall: 9152987821 for support.',
    ],
    critical: [
      '🚨 Please seek help immediately.',
      '📞 Call iCall: 9152987821 right now.',
      '🏥 Contact NIMHANS: 080-46110007.',
      '💬 Tell a trusted adult or friend how you feel.',
    ],
  };

  const msgs = recommendations[risk_level] || recommendations.moderate;

  const metrics = [
    { label: 'Mood', value: mood_score, max: 10, color: '#4f8ef7', icon: '😊' },
    { label: 'Stress', value: stress_score, max: 10, color: '#f87171', icon: '😰' },
    { label: 'Anxiety', value: anxiety_score, max: 10, color: '#fbbf24', icon: '😟' },
    { label: 'Sleep (hrs)', value: sleep_hours, max: 12, color: '#34d399', icon: '💤' },
  ];

  return (
    <div>
      {/* Crisis banner for high/critical */}
      {(risk_level === 'high' || risk_level === 'critical') && (
        <CrisisBanner risk={risk_level} onBookAppointment={onBookAppointment} />
      )}

      {/* Score summary */}
      <div
        style={{
          textAlign: 'center',
          padding: '28px',
          background: `${color}11`,
          borderRadius: '14px',
          border: `1px solid ${color}33`,
          marginBottom: '20px',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Your Stress Score
        </div>
        <div style={{ fontSize: '56px', fontWeight: 800, color, lineHeight: 1 }}>
          {computed_stress}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '12px' }}>
          out of 100
        </div>
        <RiskBadge risk={risk_level} size="md" pulse />
      </div>

      {/* Metric breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '12px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span>{m.icon}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {m.label}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: m.color, marginBottom: '6px' }}>
              {m.value}
            </div>
            <div
              style={{
                height: '4px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(m.value / m.max) * 100}%`,
                  height: '100%',
                  background: m.color,
                  borderRadius: '2px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
          Recommendations
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {msgs.map((msg, idx) => (
            <div
              key={idx}
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.04)',
                padding: '10px 14px',
                borderRadius: '8px',
                lineHeight: 1.5,
              }}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {onBookAppointment && (
          <button
            onClick={onBookAppointment}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            📅 Book Appointment
          </button>
        )}
        {onRetake && (
          <button
            onClick={onRetake}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            🔄 Retake Survey
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyResults;