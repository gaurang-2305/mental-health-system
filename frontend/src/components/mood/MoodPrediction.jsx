import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { getMoodColor, getMoodEmoji, average } from '../../utils/helpers';

const MoodPrediction = () => {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    generatePrediction();
  }, [user?.id]);

  const generatePrediction = async () => {
    setLoading(true);
    try {
      // Fetch last 7 days mood logs
      const { data: moods } = await supabase
        .from('mood_logs')
        .select('mood_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);

      if (!moods || moods.length < 3) {
        setPrediction(null);
        return;
      }

      const scores = moods.map((m) => m.mood_score);
      const avg = average(scores);

      // Simple weighted average trend
      const recent = scores.slice(0, 3);
      const recentAvg = average(recent);
      const older = scores.slice(3);
      const olderAvg = older.length ? average(older) : recentAvg;

      // Trend direction
      const trend = recentAvg - olderAvg;
      const predicted = Math.max(1, Math.min(10, Math.round(recentAvg + trend * 0.3)));

      const confidence = moods.length >= 7 ? 'High' : moods.length >= 5 ? 'Medium' : 'Low';
      const emoji = getMoodEmoji(predicted);
      const color = getMoodColor(predicted);

      // Insights
      const insights = [];
      if (trend > 0.5) insights.push('📈 Your mood has been improving recently!');
      else if (trend < -0.5) insights.push('📉 Your mood has been declining — please take care of yourself.');
      else insights.push('📊 Your mood has been relatively stable.');

      if (avg >= 7) insights.push('✨ Overall positive mood trend this week.');
      else if (avg <= 4) insights.push('💙 This seems like a tough week. Consider talking to someone.');

      setPrediction({ score: predicted, emoji, color, confidence, trend, insights });
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '13px' }}>
        Analyzing mood patterns...
      </div>
    );
  }

  if (!prediction) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '13px' }}>
        Log mood for at least 3 days to see predictions.
      </div>
    );
  }

  return (
    <div>
      {/* Prediction display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          background: `${prediction.color}11`,
          borderRadius: '12px',
          border: `1px solid ${prediction.color}33`,
          marginBottom: '14px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>{prediction.emoji.emoji}</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: prediction.color }}>
            {prediction.score}/10
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Tomorrow's Predicted Mood
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {prediction.emoji.label} · Confidence: {prediction.confidence}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: prediction.trend > 0 ? '#34d399' : prediction.trend < 0 ? '#f87171' : 'var(--text-muted)',
            }}
          >
            <span>{prediction.trend > 0.1 ? '↑' : prediction.trend < -0.1 ? '↓' : '→'}</span>
            <span>
              {prediction.trend > 0.1
                ? `Trending up (+${prediction.trend.toFixed(1)})`
                : prediction.trend < -0.1
                ? `Trending down (${prediction.trend.toFixed(1)})`
                : 'Stable trend'}
            </span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {prediction.insights.map((insight, idx) => (
          <div
            key={idx}
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              background: 'rgba(255,255,255,0.04)',
              padding: '8px 12px',
              borderRadius: '8px',
            }}
          >
            {insight}
          </div>
        ))}
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
        * Predictions are based on your recent mood patterns and are not medical advice.
      </p>
    </div>
  );
};

export default MoodPrediction;