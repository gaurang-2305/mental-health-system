export async function analyzeSymptoms(req, res) {
  try {
    res.json({ message: 'Symptoms analyzed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
