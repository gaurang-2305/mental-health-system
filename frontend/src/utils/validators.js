/**
 * Validate email address
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate password strength
 * Returns { valid: bool, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  return { valid: errors.length === 0, errors };
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};

/**
 * Validate registration form
 */
export const validateRegistration = (data) => {
  const errors = {};

  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.full_name = 'Full name must be at least 2 characters';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const { valid, errors: pwdErrors } = validatePassword(data.password);
    if (!valid) errors.password = pwdErrors.join(', ');
  }

  if (data.confirm_password !== undefined && data.password !== data.confirm_password) {
    errors.confirm_password = 'Passwords do not match';
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit Indian phone number';
  }

  if (data.age !== undefined) {
    const age = parseInt(data.age);
    if (isNaN(age) || age < 15 || age > 35) {
      errors.age = 'Age must be between 15 and 35';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate login form
 */
export const validateLogin = (data) => {
  const errors = {};

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate mood entry
 */
export const validateMoodEntry = (data) => {
  const errors = {};

  if (!data.mood_score || data.mood_score < 1 || data.mood_score > 10) {
    errors.mood_score = 'Mood score must be between 1 and 10';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate sleep log
 */
export const validateSleepLog = (data) => {
  const errors = {};

  if (!data.bedtime) errors.bedtime = 'Bedtime is required';
  if (!data.wake_time) errors.wake_time = 'Wake time is required';

  if (data.sleep_hours !== undefined) {
    const hours = parseFloat(data.sleep_hours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      errors.sleep_hours = 'Sleep hours must be between 0 and 24';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate appointment booking
 */
export const validateAppointment = (data) => {
  const errors = {};

  if (!data.counselor_id) errors.counselor_id = 'Please select a counselor';

  if (!data.scheduled_at) {
    errors.scheduled_at = 'Please select a date and time';
  } else {
    const date = new Date(data.scheduled_at);
    if (date < new Date()) {
      errors.scheduled_at = 'Appointment must be in the future';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate goal creation
 */
export const validateGoal = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Goal title must be at least 3 characters';
  }

  if (data.target_date) {
    const date = new Date(data.target_date);
    if (date < new Date()) {
      errors.target_date = 'Target date must be in the future';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate journal entry
 */
export const validateJournalEntry = (data) => {
  const errors = {};

  if (!data.content || data.content.trim().length < 10) {
    errors.content = 'Journal entry must be at least 10 characters';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate forum post
 */
export const validateForumPost = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Post title must be at least 5 characters';
  }

  if (!data.content || data.content.trim().length < 10) {
    errors.content = 'Post content must be at least 10 characters';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Sanitize input string (basic XSS prevention)
 */
export const sanitizeInput = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Check if string is empty or only whitespace
 */
export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

export default {
  isValidEmail,
  validatePassword,
  isValidPhone,
  validateRegistration,
  validateLogin,
  validateMoodEntry,
  validateSleepLog,
  validateAppointment,
  validateGoal,
  validateJournalEntry,
  validateForumPost,
  sanitizeInput,
  isEmpty,
};