const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

// POST /api/recommendations/generate
async function generateRecommendations(req, res, next) {
  try {
    const id = req.userId;

    // Gather recent data to personalise recommendations
    const [moodRes, stressRes, sleepRes, surveyRes, lifestyleRes, journalRes] = await Promise.all([
      supabase.from('mood_logs').select('mood_score, logged_at').eq('student_id', id).order('logged_at', { ascending: false }).limit(7),
      supabase.from('stress_scores').select('score, risk_level').eq('student_id', id).order('computed_at', { ascending: false }).limit(3),
      supabase.from('sleep_logs').select('sleep_hours, sleep_quality').eq('student_id', id).order('logged_date', { ascending: false }).limit(7),
      supabase.from('surveys').select('anxiety_level, stress_score, mood_score').eq('student_id', id).order('submitted_at', { ascending: false }).limit(3),
      supabase.from('lifestyle_logs').select('exercise_minutes, diet_quality, water_intake_liters').eq('student_id', id).order('logged_date', { ascending: false }).limit(5),
      supabase.from('journal_entries').select('sentiment, sentiment_score').eq('student_id', id).order('created_at', { ascending: false }).limit(5),
    ]);

    const moods = moodRes.data || [];
    const stresses = stressRes.data || [];
    const sleeps = sleepRes.data || [];
    const surveys = surveyRes.data || [];
    const lifestyle = lifestyleRes.data || [];
    const journals = journalRes.data || [];

    // Compute averages
    const avgMood = moods.length
      ? (moods.reduce((s, r) => s + r.mood_score, 0) / moods.length).toFixed(1) : 5;
    const avgSleep = sleeps.length
      ? (sleeps.reduce((s, r) => s + Number(r.sleep_hours), 0) / sleeps.length).toFixed(1) : 7;
    const stressRisk = stresses[0]?.risk_level || 'moderate';
    const avgStressScore = stresses.length
      ? (stresses.reduce((s, r) => s + Number(r.score), 0) / stresses.length).toFixed(0) : 50;
    const anxiety = surveys[0]?.anxiety_level || 5;
    const avgExercise = lifestyle.length
      ? Math.round(lifestyle.reduce((s, r) => s + (r.exercise_minutes || 0), 0) / lifestyle.length) : 0;
    const avgWater = lifestyle.length
      ? (lifestyle.reduce((s, r) => s + (r.water_intake_liters || 0), 0) / lifestyle.length).toFixed(1) : 0;
    const negativeSentimentCount = journals.filter(j => j.sentiment === 'negative').length;
    const moodTrend = moods.length >= 3
      ? (moods[0].mood_score > moods[moods.length - 1].mood_score ? 'improving' : moods[0].mood_score < moods[moods.length - 1].mood_score ? 'declining' : 'stable')
      : 'unknown';

    // Build a rich context string for Grok
    const contextSummary = `
Student wellness context:
- Average mood score: ${avgMood}/10 (trend: ${moodTrend})
- Average sleep: ${avgSleep} hours/night
- Stress risk level: ${stressRisk} (avg score: ${avgStressScore}/100)
- Anxiety level: ${anxiety}/10
- Average daily exercise: ${avgExercise} minutes
- Average water intake: ${avgWater} litres/day
- Recent negative journal entries: ${negativeSentimentCount} out of ${journals.length}
- Recent mood scores: ${moods.slice(0, 5).map(m => m.mood_score).join(', ') || 'none'}
`.trim();

    let recommendations = [];

    try {
      const aiResponse = await grokChat([{
        role: 'user',
        content: `You are a mental health wellness coach for university students in India. Based on this student's data, generate 5 highly personalised, specific, and actionable wellness recommendations.

${contextSummary}

Requirements:
- Each recommendation must be SPECIFIC to the data above (reference actual numbers/patterns)
- Vary the categories: include at least one from each of: coping/mindfulness, physical activity, sleep hygiene, social connection, and one more based on what they need most
- Be warm, encouraging, and practical — not generic
- Each recommendation should be 2-3 sentences, specific enough to act on today
- Do NOT use generic advice like "exercise more" — say exactly what, when, how long

Return ONLY a JSON array with exactly 5 objects, each with: {"content": "...", "category": "coping|exercise|sleep|social|nutrition|academic|mindfulness"}
No markdown, no explanation, just the JSON array.`
      }], { max_tokens: 800, temperature: 0.85 });

      const cleaned = aiResponse.replace(/```json|```/g, '').trim();
      // Find the JSON array
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          recommendations = parsed;
        } else {
          throw new Error('Empty or invalid array');
        }
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (aiErr) {
      console.error('Grok recommendations error:', aiErr.message);
      // Generate contextual fallbacks based on actual data
      recommendations = buildContextualFallbacks({
        avgMood: Number(avgMood),
        avgSleep: Number(avgSleep),
        stressRisk,
        avgStressScore: Number(avgStressScore),
        anxiety,
        avgExercise,
        avgWater: Number(avgWater),
        moodTrend,
        negativeSentimentCount,
      });
    }

    // Save to database
    const inserts = recommendations.map(r => ({
      student_id: id,
      content: r.content,
      category: r.category || 'wellness',
      generated_by: 'grok',
    }));

    const { data, error } = await supabase
      .from('recommendations')
      .insert(inserts)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ recommendations: data });
  } catch (err) { next(err); }
}

/**
 * Build varied, context-aware fallback recommendations when Grok fails.
 */
function buildContextualFallbacks({ avgMood, avgSleep, stressRisk, avgStressScore, anxiety, avgExercise, avgWater, moodTrend, negativeSentimentCount }) {
  const recs = [];

  // Sleep rec
  if (avgSleep < 6) {
    recs.push({
      content: `Your average sleep of ${avgSleep} hours is below the recommended 7-9 hours. Tonight, set a bedtime alarm 30 minutes earlier than usual and put your phone on Do Not Disturb. Even one extra hour of sleep can reduce your stress score significantly.`,
      category: 'sleep',
    });
  } else if (avgSleep < 7) {
    recs.push({
      content: `You're getting ${avgSleep} hours of sleep on average — you're close to the healthy range! Try a consistent wake time (even on weekends) to improve sleep quality without needing more hours.`,
      category: 'sleep',
    });
  } else {
    recs.push({
      content: `Your sleep of ${avgSleep} hours is solid! To protect it, avoid caffeine after 2 PM and spend 5 minutes doing a body scan (close eyes, relax each muscle group from toes upward) before bed.`,
      category: 'sleep',
    });
  }

  // Stress / coping rec
  if (stressRisk === 'critical' || stressRisk === 'high') {
    recs.push({
      content: `Your stress score of ${avgStressScore}/100 is in the ${stressRisk} range. Right now, try the physiological sigh: take two quick inhales through your nose followed by one long exhale through your mouth. Do this 3 times — it's the fastest way to calm your nervous system.`,
      category: 'coping',
    });
  } else if (stressRisk === 'moderate') {
    recs.push({
      content: `With a moderate stress level, daily micro-breaks make a big difference. Every 90 minutes, step away from your screen for 5 minutes — look at something 20 feet away, stretch your neck, and take 3 slow breaths. This prevents stress from building up.`,
      category: 'coping',
    });
  } else {
    recs.push({
      content: `Your stress is well-managed right now. To stay that way, try starting each morning with 2 minutes of gratitude journaling — write just 3 specific things you appreciate. This builds psychological resilience for harder days ahead.`,
      category: 'coping',
    });
  }

  // Exercise rec
  if (avgExercise < 15) {
    recs.push({
      content: `You've been averaging only ${avgExercise} minutes of exercise daily. Start small: a 15-minute brisk walk after your next meal will boost your mood more than you expect. Walking after eating also helps with focus and energy for 2-3 hours.`,
      category: 'exercise',
    });
  } else if (avgExercise < 30) {
    recs.push({
      content: `You're exercising ${avgExercise} minutes daily — great foundation! Try adding 10 minutes of resistance training (bodyweight squats, push-ups, lunges) 3 times a week. This releases mood-lifting endorphins that last longer than cardio alone.`,
      category: 'exercise',
    });
  } else {
    recs.push({
      content: `Your ${avgExercise} minutes of daily exercise is excellent for mental health! Make sure you're also including at least one rest/recovery day per week — overtraining can increase cortisol and worsen anxiety.`,
      category: 'exercise',
    });
  }

  // Social rec
  if (negativeSentimentCount >= 3 || avgMood < 5) {
    recs.push({
      content: `Your recent journal entries and mood scores suggest you might be feeling isolated. Reach out to one person today — not to talk about problems, just to share something small (a meme, a memory, a check-in). Human connection is one of the fastest mood boosters.`,
      category: 'social',
    });
  } else if (moodTrend === 'declining') {
    recs.push({
      content: `Your mood has been trending downward recently. Plan one social activity this week — even a 30-minute coffee with a friend. Anticipating a positive event can lift mood before the event even happens.`,
      category: 'social',
    });
  } else {
    recs.push({
      content: `Social connection is your protective shield against stress. This week, try a "phone-free hour" with a friend or classmate — put phones face down and just talk. These deeper interactions recharge your emotional battery more than scrolling social media.`,
      category: 'social',
    });
  }

  // Anxiety / mindfulness rec
  if (anxiety >= 7) {
    recs.push({
      content: `With an anxiety level of ${anxiety}/10, grounding techniques can give immediate relief. Try the 5-4-3-2-1 method: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This pulls your mind out of anxious thought loops within 2 minutes.`,
      category: 'mindfulness',
    });
  } else if (avgWater < 1.5) {
    recs.push({
      content: `You're drinking only ${avgWater}L of water daily — dehydration directly worsens mood, concentration, and anxiety. Try keeping a 1-litre bottle visible on your desk. Aim to finish it before noon, then refill. This one habit has a surprisingly strong effect on mental clarity.`,
      category: 'nutrition',
    });
  } else {
    recs.push({
      content: `Try a 5-minute mindfulness practice today: sit comfortably, close your eyes, and simply notice your breath without controlling it. When thoughts arise, label them as "thinking" and return to the breath. Even one session reduces cortisol measurably.`,
      category: 'mindfulness',
    });
  }

  return recs;
}

// GET /api/recommendations
async function getRecommendations(req, res, next) {
  try {
    const { category, unread_only, limit = 20 } = req.query;

    let query = supabase
      .from('recommendations')
      .select('*')
      .eq('student_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (category) query = query.eq('category', category);
    if (unread_only === 'true') query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ recommendations: data });
  } catch (err) { next(err); }
}

// PATCH /api/recommendations/:id/read
async function markAsRead(req, res, next) {
  try {
    const { error } = await supabase
      .from('recommendations')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('student_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Recommendation marked as read' });
  } catch (err) { next(err); }
}

// PATCH /api/recommendations/read-all
async function markAllAsRead(req, res, next) {
  try {
    const { error } = await supabase
      .from('recommendations')
      .update({ is_read: true })
      .eq('student_id', req.userId)
      .eq('is_read', false);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'All recommendations marked as read' });
  } catch (err) { next(err); }
}

module.exports = { generateRecommendations, getRecommendations, markAsRead, markAllAsRead };