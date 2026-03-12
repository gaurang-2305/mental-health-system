export async function createBackup(req, res) {
  try {
    res.json({ message: 'Backup created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
