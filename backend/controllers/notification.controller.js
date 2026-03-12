export async function getNotifications(req, res) {
  try {
    res.json({ message: 'Notifications retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
