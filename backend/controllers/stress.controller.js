export async function getStressScore(req, res) {
  try {
    res.json({ message: 'Stress score retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
