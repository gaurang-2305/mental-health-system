export async function register(req, res) {
  try {
    // Registration logic
    res.json({ message: 'User registered' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    // Login logic
    res.json({ message: 'User logged in' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function adminLogin(req, res) {
  try {
    // Admin login logic
    res.json({ message: 'Admin logged in' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
