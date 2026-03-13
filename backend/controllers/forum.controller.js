const supabase = require('../config/supabase');

// GET /api/forum/posts
async function getPosts(req, res, next) {
  try {
    const { limit = 20, offset = 0, search } = req.query;

    let query = supabase
      .from('forum_posts')
      .select('*, author:student_id(full_name), replies:forum_replies(count)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    // Mask anonymous authors
    const posts = data.map(p => ({
      ...p,
      author: p.is_anonymous ? { full_name: 'Anonymous' } : p.author,
    }));

    res.json({ posts, total: count });
  } catch (err) { next(err); }
}

// GET /api/forum/posts/:id
async function getPost(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, author:student_id(full_name)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Post not found' });

    const { data: replies } = await supabase
      .from('forum_replies')
      .select('*, author:student_id(full_name)')
      .eq('post_id', req.params.id)
      .order('created_at', { ascending: true });

    res.json({
      post: { ...data, author: data.is_anonymous ? { full_name: 'Anonymous' } : data.author },
      replies: replies || [],
    });
  } catch (err) { next(err); }
}

// POST /api/forum/posts
async function createPost(req, res, next) {
  try {
    const { title, content, is_anonymous = false } = req.body;

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({ student_id: req.userId, title, content, is_anonymous })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ post: data });
  } catch (err) { next(err); }
}

// PUT /api/forum/posts/:id
async function updatePost(req, res, next) {
  try {
    const { title, content } = req.body;

    const { data, error } = await supabase
      .from('forum_posts')
      .update({ title, content })
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ post: data });
  } catch (err) { next(err); }
}

// DELETE /api/forum/posts/:id
async function deletePost(req, res, next) {
  try {
    // Admin can delete any; student can only delete their own
    let query = supabase.from('forum_posts').delete().eq('id', req.params.id);
    if (req.roleId < 3) query = query.eq('student_id', req.userId);

    const { error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Post deleted' });
  } catch (err) { next(err); }
}

// POST /api/forum/posts/:id/replies
async function createReply(req, res, next) {
  try {
    const { content } = req.body;

    const { data, error } = await supabase
      .from('forum_replies')
      .insert({ post_id: req.params.id, student_id: req.userId, content })
      .select('*, author:student_id(full_name)')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ reply: data });
  } catch (err) { next(err); }
}

// DELETE /api/forum/replies/:id
async function deleteReply(req, res, next) {
  try {
    let query = supabase.from('forum_replies').delete().eq('id', req.params.id);
    if (req.roleId < 3) query = query.eq('student_id', req.userId);

    const { error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Reply deleted' });
  } catch (err) { next(err); }
}

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, createReply, deleteReply };