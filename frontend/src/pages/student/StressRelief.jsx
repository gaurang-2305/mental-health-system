import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recordGameSession } from '../../services/dataService';
import { Button, Card, Slider } from '../../components/ui/index.jsx';

const GAMES = [
  { id: 'breathing', name: '4-7-8 Breathing', icon: '🫁', desc: 'A calming breathing technique to reduce anxiety instantly.', duration: 3 },
  { id: 'gratitude', name: 'Gratitude Jar', icon: '🫙', desc: 'Write 3 things you\'re grateful for today.', duration: 2 },
  { id: 'box', name: 'Box Breathing', icon: '📦', desc: 'Breathe in, hold, out, hold — used by Navy SEALs.', duration: 4 },
  { id: 'mindful', name: 'Mindful Moment', icon: '🧘', desc: 'A 5-minute guided mindfulness exercise.', duration: 5 },
  { id: 'affirmation', name: 'Positive Affirmations', icon: '💪', desc: 'Repeat powerful affirmations to boost your confidence.', duration: 2 },
];

const AFFIRMATIONS = [
  "I am capable of handling whatever comes my way.",
  "I choose to focus on what I can control.",
  "My mental health is a priority.",
  "I am worthy of love and support.",
  "I have overcome challenges before and I will again.",
  "Each day is a new opportunity to grow.",
  "I am enough, just as I am.",
];

function BreathingExercise({ type, onComplete }) {
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(type === '478' ? 4 : 4);
  const [cycles, setCycles] = useState(0);
  const phases478 = [['inhale', 4], ['hold', 7], ['exhale', 8]];
  const phasesBox = [['inhale', 4], ['hold', 4], ['exhale', 4], ['hold', 4]];
  const phaseList = type === '478' ? phases478 : phasesBox;
  const phaseIdx = phaseList.findIndex(p => p[0] === phase);

  React.useEffect(() => {
    if (cycles >= 4) { onComplete(); return; }
    const [, dur] = phaseList[phaseIdx];
    let c = dur;
    setCount(c);
    const interval = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(interval);
        const next = (phaseIdx + 1) % phaseList.length;
        if (next === 0) setCycles(cy => cy + 1);
        setPhase(phaseList[next][0]);
        setCount(phaseList[next][1]);
      } else setCount(c);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, cycles]);

  const color = phase === 'inhale' ? 'var(--success)' : phase === 'hold' ? 'var(--warning)' : 'var(--primary)';
  const scale = phase === 'inhale' ? 1.3 : phase === 'hold' ? 1.3 : 0.8;

  return (
    <div style={{ textAlign: 'center', padding: '30px 0' }}>
      <div style={{ width: 140, height: 140, borderRadius: '50%', background: `${color}20`, border: `3px solid ${color}`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 1s ease, background 1s', transform: `scale(${scale})` }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color }}>{count}</div>
          <div style={{ fontSize: 13, textTransform: 'capitalize', color }}>{phase}</div>
        </div>
      </div>
      <div style={{ fontSize: 14, color: 'var(--text2)' }}>Cycle {cycles + 1} of 4</div>
      <Button variant="secondary" onClick={onComplete} style={{ marginTop: 20 }}>Stop</Button>
    </div>
  );
}

export default function StressRelief() {
  const { profile } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(null);
  const [afIdx, setAfIdx] = useState(0);
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [done, setDone] = useState(false);

  async function startGame(game) {
    setActiveGame(game); setMoodBefore(5); setMoodAfter(null); setDone(false); setAfIdx(0); setGratitude(['', '', '']);
  }

  async function completeGame(finalMood) {
    const mood = finalMood ?? moodBefore;
    setMoodAfter(mood); setDone(true);
    await recordGameSession(profile.id, activeGame.name, activeGame.duration, moodBefore, mood).catch(() => {});
  }

  if (activeGame) return (
    <div className="animate-fade" style={{ maxWidth: 520, margin: '0 auto' }}>
      <button onClick={() => setActiveGame(null)} style={{ background: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>← Back to games</button>
      {done ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h2>Well done!</h2>
            <p style={{ color: 'var(--text2)', marginTop: 8 }}>You completed the {activeGame.name}. Taking time for yourself matters.</p>
            <Button onClick={() => setActiveGame(null)} style={{ marginTop: 20 }}>← Back to Games</Button>
          </div>
        </Card>
      ) : (
        <Card title={`${activeGame.icon} ${activeGame.name}`}>
          {(activeGame.id === 'breathing' || activeGame.id === 'box') && !done && (
            <BreathingExercise type={activeGame.id === 'breathing' ? '478' : 'box'} onComplete={() => completeGame(moodBefore + 1)} />
          )}
          {activeGame.id === 'affirmation' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', padding: '24px', background: 'var(--bg3)', borderRadius: 12, lineHeight: 1.6, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>"{AFFIRMATIONS[afIdx]}"</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Button variant="secondary" onClick={() => setAfIdx((afIdx + 1) % AFFIRMATIONS.length)}>Next Affirmation</Button>
                <Button onClick={() => completeGame()}>Done 🌟</Button>
              </div>
            </div>
          )}
          {activeGame.id === 'gratitude' && (
            <div style={{ padding: '10px 0' }}>
              <p style={{ color: 'var(--text2)', marginBottom: 20, fontSize: 14 }}>Write 3 things you are grateful for right now, no matter how small:</p>
              {gratitude.map((g, i) => (
                <div key={i} className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label">{i + 1}. I'm grateful for...</label>
                  <input value={g} onChange={e => { const arr = [...gratitude]; arr[i] = e.target.value; setGratitude(arr); }} placeholder="Something or someone you appreciate..." />
                </div>
              ))}
              <Button onClick={() => completeGame()} style={{ marginTop: 10 }} disabled={!gratitude.every(g => g.trim())}>Save Gratitude 🫙</Button>
            </div>
          )}
          {activeGame.id === 'mindful' && (
            <div style={{ padding: '10px 0' }}>
              {['Notice 5 things you can see', 'Notice 4 things you can touch', 'Notice 3 things you can hear', 'Notice 2 things you can smell', 'Notice 1 thing you can taste'].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ color: 'var(--text)' }}>{step}</span>
                </div>
              ))}
              <Button onClick={() => completeGame()} style={{ marginTop: 20, width: '100%' }}>Completed 🧘</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="page-header"><h1>🎮 Stress Relief Activities</h1><p>Fun and effective activities to reduce stress and improve your mood.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {GAMES.map(g => (
          <div key={g.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => startGame(g)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{g.icon}</div>
            <h3 style={{ marginBottom: 8 }}>{g.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 14 }}>{g.desc}</p>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>⏱ ~{g.duration} minutes</div>
          </div>
        ))}
      </div>
    </div>
  );
}