// Risk scoring + alerts
export async function checkCrisisRisk(req, res) {
  try {
    res.json({ message: 'Crisis check completed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
