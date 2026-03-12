// Peer Forum
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getForumPosts, createForumPost, getForumReplies, createReply } from '../../services/dataService';
import { Button, Card, Loader, Modal } from '../../components/ui/index.jsx';

export default function PeerForum() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', is_anonymous: false });
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getForumPosts().then(d => { setPosts(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function loadReplies(post) {
    setSelected(post);
    const r = await getForumReplies(post.id);
    setReplies(r);
  }

  async function handlePost() {
    setSaving(true);
    try {
      const p = await createForumPost(profile.id, form.title, form.content, form.is_anonymous);
      setPosts([p, ...posts]);
      setShowModal(false); setForm({ title: '', content: '', is_anonymous: false });
    } finally { setSaving(false); }
  }

  async function handleReply() {
    if (!replyText.trim()) return;
    const r = await createReply(profile.id, selected.id, replyText);
    setReplies([...replies, r]); setReplyText('');
  }

  if (loading) return <Loader />;

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-header" style={{ margin: 0 }}><h1>👥 Peer Support Forum</h1><p>Share, connect, and support each other.</p></div>
        <Button onClick={() => setShowModal(true)}>+ New Post</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 24 }}>
        <Card title="Community Posts">
          {posts.length === 0 ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)' }}>No posts yet. Be the first to share!</div> :
            posts.map(p => (
              <div key={p.id} onClick={() => loadReplies(p)} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.content}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>👤 {p.is_anonymous ? 'Anonymous' : p.student?.full_name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
        </Card>

        {selected && (
          <Card title={selected.title} action={<button onClick={() => setSelected(null)} style={{ background: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>}>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.7 }}>{selected.content}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Replies ({replies.length})</div>
            <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 14 }}>
              {replies.map(r => (
                <div key={r.id} style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--primary)', marginBottom: 4 }}>{r.student?.full_name || 'User'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{r.content}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a supportive reply..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && handleReply()} />
              <Button onClick={handleReply} size="sm">Reply</Button>
            </div>
          </Card>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Forum Post"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handlePost} loading={saving} disabled={!form.title || !form.content}>Post</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label className="form-label">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What's on your mind?" /></div>
          <div className="form-group"><label className="form-label">Content</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Share your thoughts or ask for support..." /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm({ ...form, is_anonymous: e.target.checked })} />
            Post anonymously
          </label>
        </div>
      </Modal>
    </div>
  );
}