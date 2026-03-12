import { useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

const QUICK_RESPONSES = [
  "I'm feeling anxious",
  "I need help with stress",
  "I can't sleep well",
  "I'm feeling overwhelmed",
  "Tell me a coping technique",
  "I need motivation",
];

const FALLBACK_RESPONSES = [
  "I hear you. It takes courage to share how you're feeling. Would you like to talk more about what's been on your mind?",
  "Thank you for sharing that with me. Remember, your feelings are valid and you're not alone. What's been the most challenging part?",
  "That sounds really difficult. Let's work through this together. Have you tried any relaxation techniques recently?",
  "I'm here to support you. Sometimes just acknowledging our feelings can help. What would feel most helpful right now?",
  "Your mental health matters. It might help to talk to a counselor if you're feeling overwhelmed. Would you like me to help you schedule an appointment?",
];

let fallbackIdx = 0;

export const useChatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm MindCare AI, your mental health companion. I'm here to listen and support you. How are you feeling today? 💙",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    async (content) => {
      if (!content?.trim()) return;

      const userMsg = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      // Save user message to DB
      if (user?.id) {
        supabase.from('chat_history').insert([
          { user_id: user.id, role: 'user', message: content.trim() },
        ]);
      }

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: messages.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userId: user?.id,
          }),
          signal: controller.signal,
        });

        let aiText = '';
        if (response.ok) {
          const data = await response.json();
          aiText = data.response || data.message || '';
        }

        if (!aiText) {
          aiText = FALLBACK_RESPONSES[fallbackIdx % FALLBACK_RESPONSES.length];
          fallbackIdx++;
        }

        const aiMsg = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: aiText,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Save AI message to DB
        if (user?.id) {
          supabase.from('chat_history').insert([
            { user_id: user.id, role: 'assistant', message: aiText },
          ]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          const fallbackMsg = {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: FALLBACK_RESPONSES[fallbackIdx % FALLBACK_RESPONSES.length],
            timestamp: new Date().toISOString(),
          };
          fallbackIdx++;
          setMessages((prev) => [...prev, fallbackMsg]);
        }
      } finally {
        setLoading(false);
      }
    },
    [messages, user?.id]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello again! How can I support you today? 💙",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
    quickResponses: QUICK_RESPONSES,
  };
};

export default useChatbot;