export async function getAcademicData(req, res) {
  try {
    res.json({ message: 'Academic data retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
