import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getMoodEmoji, getMoodColor, average } from '../utils/helpers';

export const useMood = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMoodHistory = useCallback(async (limit = 30) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) throw err;
      setMoodHistory(data || []);

      // Set today's mood
      const today = new Date().toISOString().split('T')[0];
      const todayLog = data?.find((m) => m.created_at?.startsWith(today));
      setTodayMood(todayLog || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const logMood = useCallback(async ({ mood_score, emoji, notes }) => {
    if (!user?.id) return { error: 'Not authenticated' };
    try {
      const { data, error: err } = await supabase
        .from('mood_logs')
        .insert([{ user_id: user.id, mood_score, emoji, notes }])
        .select()
        .single();

      if (err) throw err;
      setMoodHistory((prev) => [data, ...prev]);
      setTodayMood(data);
      return { data };
    } catch (err) {
      return { error: err.message };
    }
  }, [user?.id]);

  const avgMood = moodHistory.length
    ? Math.round(average(moodHistory.map((m) => m.mood_score)) * 10) / 10
    : 0;

  const moodTrend = moodHistory.slice(0, 7).map((m) => ({
    date: m.created_at?.split('T')[0],
    score: m.mood_score,
    emoji: getMoodEmoji(m.mood_score),
    color: getMoodColor(m.mood_score),
  }));

  useEffect(() => {
    fetchMoodHistory();
  }, [fetchMoodHistory]);

  return {
    moodHistory,
    todayMood,
    avgMood,
    moodTrend,
    loading,
    error,
    logMood,
    refetch: fetchMoodHistory,
    getMoodEmoji,
    getMoodColor,
  };
};

export default useMood;