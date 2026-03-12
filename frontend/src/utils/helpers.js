export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString();
}

export function calculateDaysSince(date) {
  const now = new Date();
  const then = new Date(date);
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}
