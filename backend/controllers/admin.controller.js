export async function getAdminDashboard(req, res) {
  try {
    res.json({ message: 'Admin dashboard retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
