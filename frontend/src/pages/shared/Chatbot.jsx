import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatWithAI } from '../../services/aiService';
import { saveChatMessage, getChatHistory } from '../../services/dataService';
import { Button, Loader } from '../../components/ui/index.jsx';

const QUICK_MESSAGES = [
  "I'm feeling stressed about exams",
  "I can't sleep well lately",
  "I feel anxious and overwhelmed",
  "I need help with breathing exercises",
  "I'm feeling lonely and isolated",
];

export default function Chatbot() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (profile?.id) {
      getChatHistory(profile.id).then(hist => {
        const mapped = hist.map(h => ({ role: h.role, content: h.message }));
        if (mapped.length === 0) {
          setMessages([{ role: 'assistant', content: `Hello ${profile.full_name?.split(' ')[0] || 'there'}! 👋 I'm your mental wellness AI assistant. I'm here to listen, support, and guide you. How are you feeling today?` }]);
        } else {
          setMessages(mapped);
        }
        setFetching(false);
      }).catch(() => {
        setMessages([{ role: 'assistant', content: "Hello! I'm your mental wellness AI. How can I support you today?" }]);
        setFetching(false);
      });
    }
  }, [profile?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      await saveChatMessage(profile.id, userMsg, 'user');
      const response = await chatWithAI(newMessages.slice(-10), `Student: ${profile.full_name}, class: ${profile.class}`);
      const assistantMsg = { role: 'assistant', content: response };
      setMessages([...newMessages, assistantMsg]);
      await saveChatMessage(profile.id, response, 'assistant');
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <Loader text="Loading conversation..." />;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h1>💬 AI Mental Wellness Chatbot</h1>
        <p>Available 24/7 to listen and support you. Completely confidential.</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.2s ease' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>
              )}
              <div style={{
                maxWidth: '72%', padding: '11px 15px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg3)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                fontSize: 14, lineHeight: 1.6,
              }}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div style={{ width: 32, height: 32, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {profile?.full_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div style={{ padding: '11px 15px', background: 'var(--bg3)', borderRadius: '18px 18px 18px 4px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, background: 'var(--text3)', borderRadius: '50%', animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick messages */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 16px 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_MESSAGES.map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message... (Enter to send)"
            style={{ flex: 1 }} disabled={loading} />
          <Button onClick={() => sendMessage()} loading={loading} disabled={!input.trim()}>Send →</Button>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 8 }}>
        🔒 Your conversations are private. If you're in crisis, please contact emergency services or your counselor.
      </div>
    </div>
  );
}