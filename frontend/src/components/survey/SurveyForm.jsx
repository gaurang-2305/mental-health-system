import React, { useState } from 'react';
import Button from '../ui/Button';
import { MOOD_EMOJIS } from '../../utils/constants';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'How often have you felt little interest or pleasure in doing things?',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  },
  {
    id: 'q2',
    text: 'How often have you felt down, depressed, or hopeless?',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  },
  {
    id: 'q3',
    text: 'How often have you had trouble falling or staying asleep?',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  },
  {
    id: 'q4',
    text: 'How difficult have these problems made it to do your work, take care of things at home, or get along with other people?',
    options: ['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult'],
  },
  {
    id: 'q5',
    text: 'How often have you felt nervous, anxious, or on edge?',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  },
];

const Slider = ({ label, value, onChange, min = 0, max = 10, step = 1, color = 'var(--primary)' }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
      <span style={{ fontSize: '16px', fontWeight: 700, color }}>{value}{max === 10 ? '/10' : ''}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: '100%',
        accentColor: color,
        cursor: 'pointer',
        height: '6px',
      }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{min}</span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{max}</span>
    </div>
  </div>
);

const SurveyForm = ({ onSubmit, loading = false }) => {
  const [step, setStep] = useState(0); // 0=sliders, 1=questions
  const [sliders, setSliders] = useState({
    mood_score: 5,
    stress_score: 5,
    anxiety_score: 5,
    sleep_hours: 7,
  });
  const [responses, setResponses] = useState({});

  const allAnswered = QUESTIONS.every((q) => responses[q.id] !== undefined);

  const handleSubmit = () => {
    onSubmit?.({
      ...sliders,
      responses,
    });
  };

  const selectedMood = MOOD_EMOJIS.find((m) => m.value === Math.round(sliders.mood_score));

  if (step === 0) {
    return (
      <div>
        {/* Mood emoji display */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>{selectedMood?.emoji}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{selectedMood?.label}</div>
        </div>

        <Slider
          label="How's your mood?"
          value={sliders.mood_score}
          onChange={(v) => setSliders((p) => ({ ...p, mood_score: v }))}
          color="#4f8ef7"
        />
        <Slider
          label="Stress level"
          value={sliders.stress_score}
          onChange={(v) => setSliders((p) => ({ ...p, stress_score: v }))}
          color="#f87171"
        />
        <Slider
          label="Anxiety level"
          value={sliders.anxiety_score}
          onChange={(v) => setSliders((p) => ({ ...p, anxiety_score: v }))}
          color="#fbbf24"
        />
        <Slider
          label="Sleep last night (hours)"
          value={sliders.sleep_hours}
          onChange={(v) => setSliders((p) => ({ ...p, sleep_hours: v }))}
          min={0}
          max={12}
          step={0.5}
          color="#34d399"
        />

        <Button fullWidth onClick={() => setStep(1)}>
          Next →
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
        Answer all questions to complete your check-in.
      </p>
      {QUESTIONS.map((q, idx) => (
        <div key={q.id} style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
            {idx + 1}. {q.text}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background:
                    responses[q.id] === oi
                      ? 'rgba(79,142,247,0.15)'
                      : 'rgba(255,255,255,0.04)',
                  border:
                    responses[q.id] === oi
                      ? '1px solid rgba(79,142,247,0.4)'
                      : '1px solid var(--border)',
                  transition: 'all 0.15s',
                  fontSize: '13px',
                  color: responses[q.id] === oi ? '#4f8ef7' : 'var(--text-secondary)',
                }}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={oi}
                  checked={responses[q.id] === oi}
                  onChange={() => setResponses((p) => ({ ...p, [q.id]: oi }))}
                  style={{ accentColor: '#4f8ef7' }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button variant="secondary" onClick={() => setStep(0)}>
          ← Back
        </Button>
        <Button
          fullWidth
          onClick={handleSubmit}
          loading={loading}
          disabled={!allAnswered}
        >
          Submit Survey
        </Button>
      </div>
    </div>
  );
};

export default SurveyForm;