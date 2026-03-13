const supabase = require('../config/supabase');

const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'mr', 'bn', 'gu', 'kn', 'ml', 'pa'];

// GET /api/language
async function getLanguage(req, res) {
  res.json({ language: req.profile.language_pref || 'en', supported: SUPPORTED_LANGUAGES });
}

// PUT /api/language
async function updateLanguage(req, res, next) {
  try {
    const { language } = req.body;

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        error: `Unsupported language. Choose from: ${SUPPORTED_LANGUAGES.join(', ')}`
      });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ language_pref: language })
      .eq('id', req.userId)
      .select('language_pref')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ language: data.language_pref, message: 'Language preference updated' });
  } catch (err) { next(err); }
}

module.exports = { getLanguage, updateLanguage };