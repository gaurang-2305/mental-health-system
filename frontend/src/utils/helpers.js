import { RISK_LEVELS, STRESS_THRESHOLDS, MOOD_EMOJIS } from './constants';

/**
 * Format a date to a readable string
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

/**
 * Format a date to time string
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date and time together
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

/**
 * Get risk level from stress score
 */
export const getRiskLevel = (score) => {
  if (score >= 80) return RISK_LEVELS.CRITICAL;
  if (score >= 60) return RISK_LEVELS.HIGH;
  if (score >= 30) return RISK_LEVELS.MODERATE;
  return RISK_LEVELS.LOW;
};

/**
 * Calculate stress score from survey inputs
 */
export const calculateStressScore = ({ mood = 5, stress = 5, anxiety = 5, sleep = 7 }) => {
  const sleepPenalty = sleep < 6 ? (6 - sleep) * 5 : 0;
  const raw = stress * 10 + anxiety * 8 + (10 - mood) * 6 + sleepPenalty;
  return Math.min(Math.round(raw / 3), 100);
};

/**
 * Get mood emoji object by value
 */
export const getMoodEmoji = (value) => {
  return MOOD_EMOJIS.find((m) => m.value === Math.round(value)) || MOOD_EMOJIS[4];
};

/**
 * Get mood color based on value (1-10)
 */
export const getMoodColor = (value) => {
  if (value >= 8) return '#34d399';
  if (value >= 6) return '#4f8ef7';
  if (value >= 4) return '#fbbf24';
  return '#f87171';
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate text to a given length
 */
export const truncate = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Get initials from full name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generate a random color from a string (for avatars)
 */
export const stringToColor = (str) => {
  if (!str) return '#4f8ef7';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#4f8ef7', '#34d399', '#a78bfa', '#f472b6', '#22d3ee', '#f97316', '#fbbf24'];
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Convert hours decimal to HH:MM format
 */
export const decimalToTime = (decimal) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours}h ${minutes}m`;
};

/**
 * Calculate average of array of numbers
 */
export const average = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

/**
 * Group array of objects by a key
 */
export const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
};

/**
 * Sort array of objects by date field (newest first)
 */
export const sortByDate = (arr, dateField = 'created_at', ascending = false) => {
  return [...arr].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Format file size in bytes to human readable
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Deep clone an object
 */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Check if a date is today
 */
export const isToday = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Get last N days as array of date strings
 */
export const getLastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};