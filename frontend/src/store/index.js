// Simple context-based state management (no Redux dependency needed)
// This store provides a lightweight alternative using React Context

export { default as authSlice, authActions } from './authSlice';
export { default as moodSlice, moodActions } from './moodSlice';
export { default as notificationSlice, notificationActions } from './notificationSlice';
export { default as surveySlice, surveyActions } from './surveySlice';