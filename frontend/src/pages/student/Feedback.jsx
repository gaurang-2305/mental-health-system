import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { formatDate, getRelativeTime } from '../../utils/helpers';

const CATEGORIES = [
  { value: 'general', label: '💬 General', description: 'General feedback about MindCare' },
  { value: 'counselor', label: '👨‍⚕️ Counselor', description: 'Feedback about your counselor session' },
  { value: 'app', label: '📱 App Feature', description: 'Feedback about app features or bugs' },
  { value: 'content', label: '📚 Content', description: 'Feedback about exercises or content' },
  { value: 'suggestion', label: '💡 Suggestion', description: 'Ideas to improve MindCare' },
];

const StarRating = ({ value, onChange, size = 28 }) => (
  <div style={{ display: 'flex', gap: '6px' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          fontSize: size,
          lineHeight: 1,
          transition: 'transform 0.1s',
          transform: star <= value ? 'scale(1.1)' : 'scale(1)',
          filter: star <= value ? 'none' : 'grayscale(1) opacity(0.4)',
        }}
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
      >
        ⭐
      </button>
    ))}
  </div>
);

const RATING_LABELS = { 0: '', 1: 'Very Poor', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Excellent' };

const CATEGORY_VARIANTS = {
  general: 'primary',
  counselor: 'success',
  app: 'purple',
  content: 'info',
  suggestion: 'warning',
};

const Feedback = () => {
  const { user } = useAuth();
  const { success, error: notify } = useNotification();

  const [form, setForm] = useState({ category: 'general', rating: 0, message: '', anonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    if (!user?.id) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error) setHistory(data || []);
    } catch (err) {
      console.error('Feedback history error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.message.trim()) { notify('Please write your feedback before submitting.'); return; }
    if (form.rating === 0) { notify('Please select a rating.'); return; }
    if (form.message.length > 1000) { notify('Feedback must be under 1000 characters.'); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('feedback').insert([{
        user_id: user.id,
        category: form.category,
        rating: form.rating,
        message: form.message.trim(),
        anonymous: form.anonymous,
      }]);
      if (error) throw error;
      success('Thank you for your feedback! 🙏');
      setSubmitted(true);
      setForm({ category: 'general', rating: 0, message: '', anonymous: false });
      fetchHistory();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      notify(`Failed to submit feedback: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Feedback</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Help us improve MindCare. Your feedback matters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: '24px' }}>
        {/* Form */}
        <div>
          {submitted && (
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '15px', marginBottom: '4px' }}>Feedback Submitted!</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thank you for helping us improve MindCare.</div>
            </div>
          )}

          <Card title="Share Your Feedback">
            {/* Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Category <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat.value }))}
                    title={cat.description}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${form.category === cat.value ? 'rgba(79,142,247,0.5)' : 'var(--border)'}`,
                      background: form.category === cat.value ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
                      color: form.category === cat.value ? '#4f8ef7' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: form.category === cat.value ? 700 : 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Overall Rating <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <StarRating value={form.rating} onChange={(r) => setForm((p) => ({ ...p, rating: r }))} />
                {form.rating > 0 && (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: form.rating >= 4 ? '#34d399' : form.rating === 3 ? '#fbbf24' : '#f87171' }}>
                    {RATING_LABELS[form.rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <Textarea
              label="Your Feedback"
              required
              placeholder="Tell us what you think, what could be better, or share your experience..."
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={5}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: form.message.length > 1000 ? '#f87171' : 'var(--text-muted)', marginTop: '-10px', marginBottom: '16px' }}>
              {form.message.length} / 1000
            </div>

            {/* Anonymous */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', marginBottom: '20px' }}>
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => setForm((p) => ({ ...p, anonymous: e.target.checked }))}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Submit anonymously</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Your name will not be shown with this feedback</div>
              </div>
            </label>

            <Button
              fullWidth
              onClick={handleSubmit}
              loading={submitting}
              disabled={!form.message.trim() || form.rating === 0 || form.message.length > 1000}
              size="lg"
            >
              Submit Feedback
            </Button>
          </Card>
        </div>

        {/* History */}
        <div>
          <Card title="Your Previous Feedback" subtitle={`${history.length} submissions`}>
            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
                No feedback submitted yet.<br />Share your thoughts to help us improve!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                {history.map((item) => (
                  <div key={item.id} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <Badge variant={CATEGORY_VARIANTS[item.category] || 'default'} size="xs">
                        {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                      </Badge>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} style={{ fontSize: '12px', filter: s <= item.rating ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 8px' }}>{item.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>🕐 {getRelativeTime(item.created_at)}</span>
                      {item.anonymous && (
                        <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>
                          Anonymous
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {history.length > 0 && (
            <Card title="Your Stats" style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Submitted', value: history.length, icon: '📝' },
                  { label: 'Avg Rating', value: `${(history.reduce((a,b) => a + (b.rating||0), 0) / history.length).toFixed(1)} ⭐`, icon: '⭐' },
                  { label: 'Latest', value: getRelativeTime(history[0].created_at), icon: '🕐' },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;