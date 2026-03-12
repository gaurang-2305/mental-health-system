// App-wide constants

export const APP_NAME = 'MindCare';
export const APP_VERSION = '1.0.0';

// Risk levels
export const RISK_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const RISK_COLORS = {
  low: '#34d399',
  moderate: '#fbbf24',
  high: '#f97316',
  critical: '#f87171',
};

export const RISK_LABELS = {
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

// Mood emojis
export const MOOD_EMOJIS = [
  { value: 1, emoji: '😭', label: 'Terrible' },
  { value: 2, emoji: '😢', label: 'Very Sad' },
  { value: 3, emoji: '😔', label: 'Sad' },
  { value: 4, emoji: '😕', label: 'Down' },
  { value: 5, emoji: '😐', label: 'Neutral' },
  { value: 6, emoji: '🙂', label: 'Okay' },
  { value: 7, emoji: '😊', label: 'Good' },
  { value: 8, emoji: '😄', label: 'Happy' },
  { value: 9, emoji: '😁', label: 'Very Happy' },
  { value: 10, emoji: '🤩', label: 'Amazing' },
];

// Survey categories
export const SURVEY_CATEGORIES = {
  PHQ9: 'phq9',
  GAD7: 'gad7',
  GENERAL: 'general',
  STRESS: 'stress',
};

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger',
  SUCCESS: 'success',
  CRISIS: 'crisis',
};

// Appointment statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Goal statuses
export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
};

// Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'mr', label: 'मराठी' },
];

// Role IDs
export const ROLES = {
  STUDENT: 1,
  COUNSELOR: 2,
  ADMIN: 3,
};

// Stress score thresholds
export const STRESS_THRESHOLDS = {
  LOW: 30,
  MODERATE: 60,
  HIGH: 80,
};

// Chart colors
export const CHART_COLORS = {
  primary: '#4f8ef7',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  purple: '#a78bfa',
  pink: '#f472b6',
  cyan: '#22d3ee',
  orange: '#f97316',
};

// Days of week
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Months
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'mindcare_token',
  USER_PREFS: 'mindcare_prefs',
  LANGUAGE: 'mindcare_lang',
};

// Recommendation categories
export const RECOMMENDATION_CATEGORIES = {
  EXERCISE: 'exercise',
  MEDITATION: 'meditation',
  SLEEP: 'sleep',
  SOCIAL: 'social',
  ACADEMIC: 'academic',
  NUTRITION: 'nutrition',
  THERAPY: 'therapy',
};

export const RECOMMENDATION_CATEGORY_COLORS = {
  exercise: '#34d399',
  meditation: '#a78bfa',
  sleep: '#4f8ef7',
  social: '#f472b6',
  academic: '#fbbf24',
  nutrition: '#22d3ee',
  therapy: '#f97316',
};

export default {
  APP_NAME,
  RISK_LEVELS,
  RISK_COLORS,
  MOOD_EMOJIS,
  CHART_COLORS,
  ROLES,
};