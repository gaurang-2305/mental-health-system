export async function scheduleAppointment(req, res) {
  try {
    res.json({ message: 'Appointment scheduled' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAppointments(req, res) {
  try {
    res.json({ message: 'Appointments retrieved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
