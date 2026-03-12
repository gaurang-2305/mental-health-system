import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { calculateStressScore, getRiskLevel } from '../utils/helpers';

export const useSurvey = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [latestSurvey, setLatestSurvey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchSurveys = useCallback(async (limit = 20) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('surveys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) throw err;
      setSurveys(data || []);
      setLatestSurvey(data?.[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const submitSurvey = useCallback(
    async ({ mood_score, stress_score, anxiety_score, sleep_hours, responses }) => {
      if (!user?.id) return { error: 'Not authenticated' };
      setSubmitting(true);
      try {
        const computed_stress = calculateStressScore({
          mood: mood_score,
          stress: stress_score,
          anxiety: anxiety_score,
          sleep: sleep_hours,
        });
        const risk_level = getRiskLevel(computed_stress);

        const { data, error: err } = await supabase
          .from('surveys')
          .insert([
            {
              user_id: user.id,
              mood_score,
              stress_score,
              anxiety_score,
              sleep_hours,
              responses,
              risk_level,
              computed_stress,
            },
          ])
          .select()
          .single();

        if (err) throw err;

        // Insert stress score record
        await supabase.from('stress_scores').insert([
          {
            user_id: user.id,
            score: computed_stress,
            risk_level,
          },
        ]);

        // Create crisis alert if high risk
        if (risk_level === 'critical' || risk_level === 'high') {
          await supabase.from('crisis_alerts').insert([
            {
              user_id: user.id,
              risk_level,
              notes: `Auto-generated from survey. Stress score: ${computed_stress}`,
            },
          ]);
        }

        setSurveys((prev) => [data, ...prev]);
        setLatestSurvey(data);
        return { data, risk_level, computed_stress };
      } catch (err) {
        return { error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return {
    surveys,
    latestSurvey,
    loading,
    submitting,
    error,
    submitSurvey,
    refetch: fetchSurveys,
  };
};

export default useSurvey;