export async function getRecommendations(req, res) {
  try {
    res.json({ message: 'Recommendations retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
