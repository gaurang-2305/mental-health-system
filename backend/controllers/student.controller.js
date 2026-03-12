export async function getProfile(req, res) {
  try {
    res.json({ message: 'Profile retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
