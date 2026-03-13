const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

// POST /api/symptoms/analyze
async function analyzeSymptoms(req, res, next) {
  try {
    const { symptoms, duration_days, severity } = req.body;
    // symptoms: array of strings e.g. ['persistent sadness', 'loss of appetite', 'poor sleep']

    let anxiety_detected    = false;
    let depression_detected = false;
    let stress_detected     = false;
    let confidence_score    = 0;
    let analysis_data       = {};

    try {
      const aiResponse = await grokChat([{
        role: 'user',
        content: `Analyze these mental health symptoms for a university student:
Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}
Duration: ${duration_days || 'unknown'} days
Severity: ${severity || 'moderate'}/10

Return ONLY JSON: {
  "anxiety_detected": boolean,
  "depression_detected": boolean,
  "stress_detected": boolean,
  "confidence_score": 0-100,
  "summary": "brief 1-2 sentence assessment",
  "recommendations": ["action1", "action2", "action3"]
}
Important: This is NOT a diagnosis. Flag appropriately.`
      }], { max_tokens: 384, temperature: 0.3 });

      const cleaned    = aiResponse.replace(/```json|```/g, '').trim();
      const parsed     = JSON.parse(cleaned);
      anxiety_detected    = parsed.anxiety_detected    || false;
      depression_detected = parsed.depression_detected || false;
      stress_detected     = parsed.stress_detected     || false;
      confidence_score    = parsed.confidence_score    || 60;
      analysis_data       = { summary: parsed.summary, recommendations: parsed.recommendations };
    } catch {
      // Keyword-based fallback
      const text = Array.isArray(symptoms) ? symptoms.join(' ').toLowerCase() : String(symptoms).toLowerCase();
      anxiety_detected    = /anxious|worry|panic|nervous|fear/.test(text);
      depression_detected = /sad|hopeless|empty|numb|worthless|depress/.test(text);
      stress_detected     = /stress|overwhelm|pressure|tense|burnout/.test(text);
      confidence_score    = 50;
      analysis_data       = { summary: 'Symptom analysis completed using keyword detection.', recommendations: [] };
    }

    const { data, error } = await supabase
      .from('symptom_analysis')
      .insert({
        student_id: req.userId,
        anxiety_detected,
        depression_detected,
        stress_detected,
        confidence_score,
        model_used:    'grok',
        analysis_data: { ...analysis_data, symptoms, duration_days, severity },
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Auto stress score if depression or high anxiety detected
    if (depression_detected || (anxiety_detected && confidence_score > 70)) {
      const risk = confidence_score > 80 ? 'high' : 'moderate';
      await supabase.from('stress_scores').insert({ student_id: req.userId, score: confidence_score, risk_level: risk });

      if (risk === 'high') {
        await supabase.from('crisis_alerts').insert({
          student_id: req.userId,
          risk_level: 'high',
          trigger_reason: `Symptom analysis: depression_detected=${depression_detected}, anxiety=${anxiety_detected}`,
        });
      }
    }

    res.status(201).json({ analysis: data });
  } catch (err) { next(err); }
}

// GET /api/symptoms
async function getAnalyses(req, res, next) {
  try {
    const { student_id, limit = 10 } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;

    const { data, error } = await supabase
      .from('symptom_analysis')
      .select('*')
      .eq('student_id', targetId)
      .order('analyzed_at', { ascending: false })
      .limit(Number(limit));

    if (error) return res.status(400).json({ error: error.message });
    res.json({ analyses: data });
  } catch (err) { next(err); }
}

module.exports = { analyzeSymptoms, getAnalyses };