export async function generateReport(req, res) {
  try {
    res.json({ message: 'Report generated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
