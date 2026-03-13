const supabase = require('../config/supabase');

const AVAILABLE_GAMES = [
  { id: 'breathing',    name: 'Breathing Exercise',  description: 'Guided 4-7-8 breathing for anxiety relief',   category: 'mindfulness' },
  { id: 'puzzle',       name: 'Calming Puzzle',       description: 'Simple jigsaw puzzles to reduce mental noise', category: 'focus' },
  { id: 'coloring',     name: 'Digital Coloring',     description: 'Mindful coloring to promote relaxation',       category: 'creative' },
  { id: 'memory',       name: 'Memory Match',         description: 'Card matching game for cognitive engagement',  category: 'focus' },
  { id: 'meditation',   name: 'Guided Meditation',    description: '5-minute audio-guided meditation session',     category: 'mindfulness' },
  { id: 'gratitude',    name: 'Gratitude Journal',    description: 'Write 3 things you\'re grateful for today',   category: 'reflection' },
];

// GET /api/games
async function getGames(req, res) {
  res.json({ games: AVAILABLE_GAMES });
}

// POST /api/games/session
async function recordSession(req, res, next) {
  try {
    const { game_name, duration_minutes, mood_before, mood_after } = req.body;

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({ student_id: req.userId, game_name, duration_minutes, mood_before, mood_after })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const moodImprovement = mood_after && mood_before ? mood_after - mood_before : null;
    res.status(201).json({
      session: data,
      mood_improvement: moodImprovement,
      message: moodImprovement > 0
        ? `Great job! Your mood improved by ${moodImprovement} points.`
        : 'Session recorded. Keep it up!',
    });
  } catch (err) { next(err); }
}

// GET /api/games/history
async function getSessionHistory(req, res, next) {
  try {
    const { limit = 20, game_name } = req.query;

    let query = supabase
      .from('game_sessions')
      .select('*')
      .eq('student_id', req.userId)
      .order('played_at', { ascending: false })
      .limit(Number(limit));

    if (game_name) query = query.eq('game_name', game_name);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const totalMinutes = data.reduce((s, r) => s + (r.duration_minutes || 0), 0);
    const avgMoodLift  = data.filter(r => r.mood_before && r.mood_after).length
      ? (data.filter(r => r.mood_before && r.mood_after)
          .reduce((s, r) => s + (r.mood_after - r.mood_before), 0) /
         data.filter(r => r.mood_before && r.mood_after).length
        ).toFixed(1)
      : null;

    res.json({ sessions: data, stats: { total_minutes: totalMinutes, avg_mood_lift: avgMoodLift, total_sessions: data.length } });
  } catch (err) { next(err); }
}

// GET /api/games/leaderboard (anonymous — encourages engagement)
async function getLeaderboard(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('student_id, duration_minutes')
      .gte('played_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) return res.status(400).json({ error: error.message });

    // Aggregate by student anonymously
    const totals = {};
    data.forEach(r => {
      totals[r.student_id] = (totals[r.student_id] || 0) + (r.duration_minutes || 0);
    });

    const sorted = Object.values(totals).sort((a, b) => b - a).slice(0, 10);
    const leaderboard = sorted.map((minutes, i) => ({ rank: i + 1, minutes }));

    res.json({ leaderboard });
  } catch (err) { next(err); }
}

module.exports = { getGames, recordSession, getSessionHistory, getLeaderboard };