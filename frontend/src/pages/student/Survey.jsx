import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitSurvey } from '../../services/dataService';
import { saveStressScore } from '../../services/dataService';
import { calculateStressScore } from '../../services/aiService';
import { Button, Card, Slider, Alert } from '../../components/ui/index.jsx';

const QUESTIONS = [
  { key: 'q1', text: 'How often have you felt overwhelmed by responsibilities?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { key: 'q2', text: 'Have you experienced difficulty concentrating on studies?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { key: 'q3', text: 'How often do you feel socially isolated?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { key: 'q4', text: 'Do you experience physical symptoms of stress (headache, fatigue)?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
  { key: 'q5', text: 'How satisfied are you with your current academic performance?', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
];

export default function Survey() {
  const { profile } = useAuth();
  const [step, setStep] = useState(0); // 0=intro, 1=sliders, 2=questions, 3=result
  const [scores, setScores] = useState({ mood: 5, stress: 5, anxiety: 5, sleep: 7 });
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    setLoading(true); setError('');
    try {
      const { score, riskLevel } = calculateStressScore({
        mood_score: scores.mood, stress_score: scores.stress,
        anxiety_level: scores.anxiety, sleep_hours: scores.sleep,
      });
      await submitSurvey(profile.id, {
        mood_score: scores.mood, stress_score: scores.stress,
        anxiety_level: scores.anxiety, sleep_hours: scores.sleep,
        responses: answers,
      });
      await saveStressScore(profile.id, score, riskLevel);
      setResult({ score, riskLevel });
      setStep(3);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const riskColors = { low: 'var(--success)', moderate: 'var(--warning)', high: 'var(--danger)', critical: 'var(--danger)' };
  const riskMessages = {
    low: "Your mental wellness looks healthy! Keep up the positive habits.",
    moderate: "You're experiencing some stress. Consider some self-care activities.",
    high: "Elevated stress detected. We recommend speaking with a counselor soon.",
    critical: "Critical stress levels detected. Please reach out to a counselor immediately.",
  };

  if (step === 3 && result) return (
    <div className="animate-fade" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ padding: '40px 0' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          {result.riskLevel === 'low' ? '🌟' : result.riskLevel === 'moderate' ? '⚠️' : '🆘'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Survey Complete</h1>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 48, fontFamily: 'var(--font-display)', color: riskColors[result.riskLevel] }}>{result.score}%</div>
          <div style={{ fontSize: 18, textTransform: 'capitalize', color: riskColors[result.riskLevel], fontWeight: 600 }}>{result.riskLevel} Risk</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24, fontSize: 14, color: 'var(--text2)' }}>
          {riskMessages[result.riskLevel]}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button onClick={() => { setStep(0); setScores({ mood: 5, stress: 5, anxiety: 5, sleep: 7 }); setAnswers({}); setResult(null); }} variant="secondary">Take Another Survey</Button>
          <Button onClick={() => window.location.href = '/student/recommendations'}>View Recommendations →</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1>📋 Mental Health Survey</h1>
        <p>Help us understand your current mental wellness state.</p>
      </div>

      {step === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
            <h2 style={{ marginBottom: 12 }}>Before we start</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 24, lineHeight: 1.7 }}>
              This survey takes about 2-3 minutes and helps us understand your mental wellness.
              Your responses are confidential and used to provide personalized support.
            </p>
            <Button onClick={() => setStep(1)} size="lg">Start Survey →</Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card title="Rate your current state">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Slider label="😊 Overall Mood" value={scores.mood} onChange={v => setScores({ ...scores, mood: v })} min={1} max={10} />
            <Slider label="😓 Stress Level" value={scores.stress} onChange={v => setScores({ ...scores, stress: v })} min={1} max={10} />
            <Slider label="😰 Anxiety Level" value={scores.anxiety} onChange={v => setScores({ ...scores, anxiety: v })} min={1} max={10} />
            <Slider label="🌙 Sleep Hours (last night)" value={scores.sleep} onChange={v => setScores({ ...scores, sleep: v })} min={0} max={12} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)} style={{ flex: 1 }}>Continue →</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="A few more questions">
          <Alert message={error} type="error" onClose={() => setError('')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {QUESTIONS.map((q, qi) => (
              <div key={q.key}>
                <div style={{ fontWeight: 500, marginBottom: 10, fontSize: 14 }}>{qi + 1}. {q.text}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers({ ...answers, [q.key]: oi })}
                      style={{ padding: '7px 6px', borderRadius: 8, border: `2px solid ${answers[q.key] === oi ? 'var(--primary)' : 'var(--border)'}`, background: answers[q.key] === oi ? 'var(--primary-glow)' : 'var(--bg3)', color: answers[q.key] === oi ? 'var(--primary)' : 'var(--text2)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleSubmit} loading={loading} style={{ flex: 1 }}
              disabled={Object.keys(answers).length < QUESTIONS.length}>
              Submit Survey →
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}