const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

// POST /api/recommendations/generate
async function generateRecommendations(req, res, next) {
  try {
    const id = req.userId;

    // Gather recent data to personalise recommendations
    const [moodRes, stressRes, sleepRes, surveyRes] = await Promise.all([
      supabase.from('mood_logs').select('mood_score').eq('student_id', id).order('logged_at', { ascending: false }).limit(7),
      supabase.from('stress_scores').select('score, risk_level').eq('student_id', id).order('computed_at', { ascending: false }).limit(1),
      supabase.from('sleep_logs').select('sleep_hours, sleep_quality').eq('student_id', id).order('logged_date', { ascending: false }).limit(7),
      supabase.from('surveys').select('anxiety_level, stress_score').eq('student_id', id).order('submitted_at', { ascending: false }).limit(1),
    ]);

    const avgMood   = moodRes.data?.length ? (moodRes.data.reduce((s, r) => s + r.mood_score, 0) / moodRes.data.length).toFixed(1) : 5;
    const avgSleep  = sleepRes.data?.length ? (sleepRes.data.reduce((s, r) => s + Number(r.sleep_hours), 0) / sleepRes.data.length).toFixed(1) : 7;
    const stressRisk = stressRes.data?.[0]?.risk_level || 'moderate';
    const anxiety   = surveyRes.data?.[0]?.anxiety_level || 5;

    let recommendations = [];

    try {
      const aiResponse = await grokChat([{
        role: 'user',
        content: `Generate 4 personalised mental wellness recommendations for a university student with:
- Average mood score: ${avgMood}/10
- Average sleep: ${avgSleep} hours/night  
- Stress risk level: ${stressRisk}
- Anxiety level: ${anxiety}/10

Return ONLY a JSON array with 4 objects, each having: {"content": "...", "category": "coping|exercise|sleep|social"}
Be specific, actionable, and encouraging. No markdown or extra text.`
      }], { max_tokens: 512, temperature: 0.7 });

      const cleaned = aiResponse.replace(/```json|```/g, '').trim();
      const parsed  = JSON.parse(cleaned);
      recommendations = parsed;
    } catch {
      // Fallback recommendations
      recommendations = [
        { content: 'Try the 4-7-8 breathing technique: inhale for 4 seconds, hold for 7, exhale for 8. Do this 3 times when feeling anxious.', category: 'coping' },
        { content: 'Take a 20-minute walk outside today. Physical movement releases endorphins and can lift your mood significantly.', category: 'exercise' },
        { content: `Aim for ${avgSleep < 7 ? 'at least 7-8' : '7-8'} hours of sleep tonight. Set a consistent bedtime to improve sleep quality.`, category: 'sleep' },
        { content: 'Reach out to one friend or family member today, even just a short message. Social connection is vital for mental wellbeing.', category: 'social' },
      ];
    }

    // Save to database
    const inserts = recommendations.map(r => ({
      student_id:   id,
      content:      r.content,
      category:     r.category,
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

    if (category)             query = query.eq('category', category);
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