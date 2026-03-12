export async function logLifestyle(req, res) {
  try {
    res.json({ message: 'Lifestyle logged' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
