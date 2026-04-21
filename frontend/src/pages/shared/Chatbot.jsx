import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getChatHistory, saveChatMessage } from '../../services/dataService';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const QUICK_MESSAGES = [
  "I'm feeling stressed about exams",
  "I can't sleep well lately",
  "I feel anxious and overwhelmed",
  "I need help with breathing exercises",
  "I'm feeling lonely and isolated",
  "How can I improve my mood?",
];

async function callBackendChatbot(message, history, token) {
  const res = await fetch(`${API_BASE}/chatbot/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      conversation_history: history.slice(-10).map(m => ({
        role:    m.role,
        message: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  return { reply: data.reply, isCrisis: data.is_crisis };
}

export default function Chatbot() {
  const { profile } = useAuth();
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);
  const bottomRef                   = useRef(null);
  const sendingRef                  = useRef(false);
  const studentName                 = profile?.full_name?.split(' ')[0] || 'there';

  // Get the Supabase session token
  async function getToken() {
    const { supabase } = await import('../../services/supabaseClient');
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || '';
  }

  // Load chat history on mount
  useEffect(() => {
    if (!profile?.id) return;
    let mounted = true;
    getChatHistory(profile.id)
      .then(hist => {
        if (!mounted) return;
        if (hist.length === 0) {
          setMessages([{
            id:      'welcome',
            role:    'assistant',
            content: `Hello ${studentName}! 👋 I'm your MindCare AI companion. I'm here to listen and support you anytime. How are you feeling today?`,
          }]);
        } else {
          setMessages(hist.map((h, i) => ({
            id:      `h-${i}`,
            role:    h.role,
            content: h.message,
          })));
        }
        setFetching(false);
      })
      .catch(() => {
        if (!mounted) return;
        setMessages([{
          id:      'welcome',
          role:    'assistant',
          content: `Hello ${studentName}! 👋 I'm MindCare AI. How can I support you today?`,
        }]);
        setFetching(false);
      });
    return () => { mounted = false; };
  }, [profile?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading || sendingRef.current) return;

    sendingRef.current = true;
    setInput('');
    setLoading(true);

    const userEntry = { id: `u-${Date.now()}`, role: 'user', content: userMsg };
    setMessages(prev => [...prev, userEntry]);

    try {
      const token = await getToken();
      const { reply, isCrisis } = await callBackendChatbot(userMsg, messages, token);

      const aiEntry = { id: `a-${Date.now()}`, role: 'assistant', content: reply };
      setMessages(prev => [...prev, aiEntry]);

    } catch (err) {
      console.error('Chatbot error:', err);
      const fallback = `${studentName}, I hear you. Try taking a slow deep breath — inhale for 4 counts, hold for 4, exhale for 6. Would you like to talk more about what's on your mind?`;
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [input, loading, messages, studentName]);

  if (fetching) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <span style={{ color: 'var(--text3)', fontSize: 13 }}>Loading conversation...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg2)' }}>
        <h1 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: 2 }}>💬 AI Mental Wellness Chatbot</h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>Available 24/7 · Completely confidential · Powered by Grok AI</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#4f8ef7,#7c5cbf)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, alignSelf: 'flex-end' }}>🤖</div>
            )}
            <div style={{
              maxWidth: '68%', padding: '11px 15px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg2)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 34, height: 34, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, alignSelf: 'flex-end', color: 'var(--text)' }}>
                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#4f8ef7,#7c5cbf)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, background: 'var(--primary)', borderRadius: '50%', animation: `bounce 1.2s ${i*0.2}s infinite` }} />
              ))}
              <style>{`@keyframes bounce{0%,80%,100%{opacity:.3;transform:scale(0.8)}40%{opacity:1;transform:scale(1.1)}}`}</style>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 2 && !loading && (
        <div style={{ padding: '8px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', alignSelf: 'center' }}>Try:</span>
          {QUICK_MESSAGES.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
            >{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--bg2)', flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type your message... (Enter to send)"
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 22px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14,
            background: !loading && input.trim() ? 'var(--primary)' : 'var(--surface)',
            color: !loading && input.trim() ? '#fff' : 'var(--text3)',
            cursor: !loading && input.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          {loading ? '...' : 'Send →'}
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', padding: '6px', background: 'var(--bg2)', flexShrink: 0 }}>
        🔒 Private · Crisis? Call iCall: 9152987821 or emergency: 112
      </div>
    </div>
  );
}