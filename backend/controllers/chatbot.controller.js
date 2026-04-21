const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

const SYSTEM_PROMPT = `You are MindCare AI, a compassionate and highly capable mental health support companion for university students in India. You are NOT a rigid script — you are an intelligent, empathetic conversationalist.

Your personality:
- Warm, genuine, and non-judgmental — like a trusted friend who happens to understand mental health deeply
- Intelligent and adaptive — you pick up on the student's tone, context, and emotional state
- You do NOT repeat the same type of response — vary your approach based on what the student needs
- Sometimes you ask thoughtful follow-up questions, sometimes you offer techniques, sometimes you just listen and validate
- You understand Indian student context: exam pressure, family expectations, hostel life, placement stress, competitive academics

Your capabilities:
- Evidence-based coping techniques (CBT, DBT, ACT, mindfulness, somatic techniques)
- Psychoeducation — explaining what's happening in the mind/body in simple terms
- Problem-solving and reframing cognitive distortions
- Motivational support and helping set small, achievable goals
- Cultural sensitivity — you understand the Indian context (joint families, parental pressure, societal expectations)
- Crisis detection and appropriate escalation

Response guidelines:
- NEVER give cookie-cutter responses. Each reply must feel tailored to what this specific student just said
- Keep responses conversational (3-5 sentences usually), but go longer when explaining a technique or when the student needs more support
- Don't always offer a technique — sometimes just acknowledge and ask more. Read the room.
- Use the student's name if you know it
- Don't start every message with "I understand" or "I hear you" — vary your openers dramatically
- You can be gently humorous when appropriate
- If someone shares good news or improvement, celebrate it genuinely

HARD RULES:
- NEVER diagnose medical conditions
- NEVER suggest or discuss specific medications
- If the student expresses suicidal ideation, self-harm, or is in immediate danger: immediately provide crisis resources and strongly urge professional help
  - iCall: 9152987821
  - Vandrevala Foundation: 1860-2662-345 (24/7 free)
  - Emergency: 112`;

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'self-harm', 'hurt myself',
  'want to die', 'better off dead', 'ending it all', 'cut myself',
  'overdose', 'no reason to live', "can't go on", 'give up on life',
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
      reply = `${studentName}, I'm really glad you reached out right now. What you're feeling sounds serious, and your life has value. Please contact a crisis helpline immediately:\n\n• **iCall**: 9152987821 (Mon-Sat, 8am-10pm)\n• **Vandrevala Foundation**: 1860-2662-345 (24/7, completely free)\n• **Emergency services**: 112\n\nYou don't have to be alone with this. I'm here with you, but please reach out to one of these now. 💙`;

      // Create crisis alert
      await supabase.from('crisis_alerts').insert({
        student_id: req.userId,
        risk_level: 'critical',
        trigger_reason: 'Crisis keywords detected in chatbot conversation',
      });
    } else {
      // Build message context — last 12 turns for better continuity
      const recent = conversation_history.slice(-12).map(m => ({
        role: m.role,
        content: m.message || m.content,
      }));

      // Add student name to system prompt
      const systemWithName = `${SYSTEM_PROMPT}\n\nThe student's name is: ${studentName}`;

      const messages = [
        ...recent,
        { role: 'user', content: message },
      ];

      try {
        reply = await grokChat(messages, {
          system: systemWithName,
          max_tokens: 600,
          temperature: 0.88,
        });
      } catch (aiErr) {
        console.error('Grok chatbot error:', aiErr.message);
        // Contextual fallback based on message content
        reply = buildContextualFallback(message, studentName);
      }
    }

    // Save AI reply
    await supabase.from('chat_messages').insert({
      student_id: req.userId,
      role: 'assistant',
      message: reply,
    });

    res.json({ reply, is_crisis: isCrisis });
  } catch (err) { next(err); }
}

/**
 * Build a contextual fallback response when Grok is unavailable.
 * Tries to match the topic rather than returning a generic message.
 */
function buildContextualFallback(message, name) {
  const lower = message.toLowerCase();

  if (/exam|study|marks|grades|academic|assignment|deadline/.test(lower)) {
    return `${name}, academic pressure is one of the most common stressors for students, and it's completely valid to feel overwhelmed by it. One thing that often helps is breaking the work into the smallest possible chunks — not "study for exams" but "read 5 pages of Chapter 3." Would you like to talk through what's on your plate right now?`;
  }
  if (/sleep|tired|insomnia|can't sleep|awake/.test(lower)) {
    return `Sleep struggles can create a really difficult cycle — you're tired but can't rest, and that makes everything harder. One technique that genuinely helps is "progressive muscle relaxation" — starting from your toes, tense each muscle group for 5 seconds then release. It tells your body it's safe to let go. What does your bedtime usually look like?`;
  }
  if (/anxious|anxiety|nervous|panic|worried|fear/.test(lower)) {
    return `That feeling of anxiety in your body is real — it's your nervous system trying to protect you, even when the threat isn't physical. Here's something quick: breathe in for 4 counts, hold for 2, breathe out for 6. The longer exhale activates your parasympathetic system and physically calms the anxiety response. How long have you been feeling this way?`;
  }
  if (/sad|depressed|lonely|alone|empty|numb/.test(lower)) {
    return `What you're describing sounds really heavy, ${name}. Feeling that emptiness or sadness — it takes courage to even name it. You don't have to have a reason for it; sometimes our minds and bodies just get exhausted. Is there anything specific that's happened recently, or does it feel more like a general weight that's been building?`;
  }
  if (/family|parents|home|relationship|friend/.test(lower)) {
    return `Relationships — especially with family — can be one of the most emotionally complex parts of life, particularly when you're navigating your own identity and expectations at the same time. What's been going on?`;
  }
  if (/stress|overwhelmed|too much|can't handle|pressure/.test(lower)) {
    return `When everything feels like too much at once, your brain actually loses its ability to prioritise — that's why overwhelm feels paralysing, not just hard. One effective reset: write down everything in your head onto paper (not a phone), then circle just ONE thing to focus on first. The act of externalising it frees up mental space. What feels most overwhelming right now?`;
  }
  if (/happy|good|better|great|improved|progress/.test(lower)) {
    return `That genuinely makes me glad to hear, ${name}! Progress in mental wellbeing isn't always linear, so celebrating these moments matters. What do you think made the difference?`;
  }

  // Generic but not robotic
  return `${name}, I want to make sure I give you the most helpful response I can. It sounds like there's something important on your mind. Can you tell me a little more about what you're going through? I'm here and I'm listening.`;
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