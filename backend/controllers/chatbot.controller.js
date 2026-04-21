const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

const SYSTEM_PROMPT = `You are MindCare AI, a compassionate and professional mental health support chatbot for university students in India.

Your role:
- Provide empathetic, non-judgmental emotional support
- Offer evidence-based coping strategies (CBT, mindfulness, breathing exercises)
- Help students identify and manage stress, anxiety, and low mood
- Encourage professional help when appropriate
- NEVER diagnose medical conditions
- NEVER prescribe medication
- If a student expresses suicidal ideation or self-harm, ALWAYS recommend immediate professional help and emergency services

Keep responses warm, concise (3-5 sentences), and actionable. Use the student's name if available.`;

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'self-harm',
  'hurt myself', 'want to die', 'better off dead', 'ending it all',
];

// POST /api/chatbot/message
async function sendMessage(req, res, next) {
  try {
    const { message, conversation_history = [] } = req.body;
    const studentName = req.profile?.full_name?.split(' ')[0] || 'there';

    // Save student message
    await supabase.from('chat_messages').insert({
      student_id: req.userId,
      role: 'user',
      message,
    });

    // Crisis detection
    const lowerMsg = message.toLowerCase();
    const isCrisis = CRISIS_KEYWORDS.some(kw => lowerMsg.includes(kw));

    let reply;

    if (isCrisis) {
      reply = `${studentName}, I'm really glad you reached out. What you're feeling sounds very serious, and your life matters. Please contact a crisis helpline immediately:\n• iCall: 9152987821\n• Vandrevala Foundation: 1860-2662-345 (24/7 free)\n• Emergency services: 112\n\nI'm here with you, but you deserve professional support right now. 💙`;

      // Create crisis alert
      await supabase.from('crisis_alerts').insert({
        student_id:     req.userId,
        risk_level:     'critical',
        trigger_reason: 'Crisis keywords detected in chatbot conversation',
      });
    } else {
      // Build message context — last 10 turns
      const recent = conversation_history.slice(-10).map(m => ({
        role:    m.role,
        content: m.message || m.content,
      }));

      const messages = [
        ...recent,
        { role: 'user', content: message },
      ];

      try {
        reply = await grokChat(messages, {
          system:      `${SYSTEM_PROMPT}\n\nStudent's name: ${studentName}`,
          max_tokens:  512,
          temperature: 0.8,
        });
      } catch (aiErr) {
        console.error('Grok chatbot error:', aiErr.message);
        reply = `I'm here to support you, ${studentName}. It sounds like you're going through a difficult time. Try taking a few slow deep breaths — inhale for 4 counts, hold for 4, exhale for 6. Would you like to talk more about what's on your mind?`;
      }
    }

    // Save AI reply
    await supabase.from('chat_messages').insert({
      student_id: req.userId,
      role:       'assistant',
      message:    reply,
    });

    res.json({ reply, is_crisis: isCrisis });
  } catch (err) { next(err); }
}

// GET /api/chatbot/history
async function getChatHistory(req, res, next) {
  try {
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('student_id', req.userId)
      .order('sent_at', { ascending: true })
      .limit(Number(limit));

    if (error) return res.status(400).json({ error: error.message });
    res.json({ messages: data });
  } catch (err) { next(err); }
}

// DELETE /api/chatbot/history
async function clearHistory(req, res, next) {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('student_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Chat history cleared' });
  } catch (err) { next(err); }
}

module.exports = { sendMessage, getChatHistory, clearHistory };