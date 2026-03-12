export async function recordSleep(req, res) {
  try {
    res.json({ message: 'Sleep data recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
