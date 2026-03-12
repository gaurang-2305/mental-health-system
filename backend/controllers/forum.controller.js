export async function createForumPost(req, res) {
  try {
    res.json({ message: 'Forum post created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getForumPosts(req, res) {
  try {
    res.json({ message: 'Forum posts retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
