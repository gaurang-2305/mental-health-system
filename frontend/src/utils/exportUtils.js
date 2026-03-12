import { formatDate, formatDateTime } from './helpers';

/**
 * Convert array of objects to CSV string
 */
export const arrayToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);
  const headerRow = keys.join(',');
  const rows = data.map((row) =>
    keys
      .map((key) => {
        const val = row[key] ?? '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str}"`
          : str;
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\n');
};

/**
 * Download a string as a file
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export data as CSV file
 */
export const exportCSV = (data, filename = 'export') => {
  const csv = arrayToCSV(data);
  downloadFile(csv, `${filename}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

/**
 * Export mood logs as CSV
 */
export const exportMoodLogs = (logs) => {
  const formatted = logs.map((log) => ({
    Date: formatDate(log.created_at),
    'Mood Score': log.mood_score,
    Emoji: log.emoji || '',
    Notes: log.notes || '',
    Sentiment: log.sentiment || '',
  }));
  exportCSV(formatted, 'mood_logs');
};

/**
 * Export sleep logs as CSV
 */
export const exportSleepLogs = (logs) => {
  const formatted = logs.map((log) => ({
    Date: formatDate(log.date),
    Bedtime: log.bedtime || '',
    'Wake Time': log.wake_time || '',
    'Hours Slept': log.sleep_hours || '',
    Quality: log.quality || '',
  }));
  exportCSV(formatted, 'sleep_logs');
};

/**
 * Export survey results as CSV
 */
export const exportSurveyResults = (surveys) => {
  const formatted = surveys.map((s) => ({
    Date: formatDate(s.created_at),
    'Mood Score': s.mood_score || '',
    'Stress Score': s.stress_score || '',
    'Anxiety Score': s.anxiety_score || '',
    'Sleep Hours': s.sleep_hours || '',
    'Risk Level': s.risk_level || '',
  }));
  exportCSV(formatted, 'survey_results');
};

/**
 * Export crisis alerts as CSV
 */
export const exportCrisisAlerts = (alerts) => {
  const formatted = alerts.map((a) => ({
    Date: formatDateTime(a.created_at),
    Student: a.user_profiles?.full_name || 'Unknown',
    'Risk Level': a.risk_level,
    Status: a.resolved ? 'Resolved' : 'Active',
    Notes: a.notes || '',
  }));
  exportCSV(formatted, 'crisis_alerts');
};

/**
 * Export user list as CSV (admin)
 */
export const exportUserList = (users) => {
  const formatted = users.map((u) => ({
    Name: u.full_name || '',
    Email: u.email || '',
    Role: u.roles?.name || '',
    Class: u.class_year || '',
    'Joined At': formatDate(u.created_at),
  }));
  exportCSV(formatted, 'users');
};

/**
 * Export weekly report as JSON (for printing)
 */
export const exportReportJSON = (report, filename = 'weekly_report') => {
  const json = JSON.stringify(report, null, 2);
  downloadFile(json, `${filename}_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};

/**
 * Generate a simple HTML report for printing
 */
export const generateHTMLReport = (title, student, data) => {
  const rows = Object.entries(data)
    .map(
      ([key, val]) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:600">${key}</td>
        <td style="padding:8px;border:1px solid #ddd">${val}</td>
      </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; padding: 24px; color: #1e293b; }
        h1 { color: #4f8ef7; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #4f8ef7; color: white; padding: 10px; text-align: left; }
      </style>
    </head>
    <body>
      <h1>MindCare — ${title}</h1>
      <p><strong>Student:</strong> ${student}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      <table>
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `;
};

/**
 * Print HTML report in a new window
 */
export const printHTMLReport = (html) => {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};