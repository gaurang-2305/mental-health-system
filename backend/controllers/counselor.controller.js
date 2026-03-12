export async function getCounselorDashboard(req, res) {
  try {
    res.json({ message: 'Counselor dashboard retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
