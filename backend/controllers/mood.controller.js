export async function recordMood(req, res) {
  try {
    res.json({ message: 'Mood recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getMoodHistory(req, res) {
  try {
    res.json({ message: 'Mood history retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
