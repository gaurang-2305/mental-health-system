const supabase = require('../config/supabase');
const XLSX     = require('xlsx');
const logger   = require('../utils/index');

const ALL_TABLES = [
  'user_profiles', 'surveys', 'mood_logs', 'stress_scores',
  'sleep_logs', 'lifestyle_logs', 'journal_entries', 'appointments',
  'crisis_alerts', 'forum_posts', 'forum_replies', 'goals',
  'feedback', 'weekly_reports', 'academic_records', 'attendance_logs',
  'recommendations', 'chat_messages', 'game_sessions', 'notifications',
];

/**
 * Fetch rows from one or more tables.
 * @param {string[]} tables  — defaults to ALL_TABLES
 * @param {number}   limit   — max rows per table
 */
async function fetchTableData(tables = ALL_TABLES, limit = 10000) {
  const results = {};
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(limit);
      results[table] = error ? [] : (data || []);
    } catch (err) {
      logger.error(`Export fetch error for ${table}: ${err.message}`);
      results[table] = [];
    }
  }
  return results;
}

/**
 * Build a JSON export buffer.
 * @param {string[]} [tables]
 * @returns {Buffer}
 */
async function toJSON(tables) {
  const data   = await fetchTableData(tables);
  const payload = { exported_at: new Date().toISOString(), data };
  return Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');
}

/**
 * Build an XLSX workbook buffer — one sheet per table.
 * @param {string[]} [tables]
 * @returns {Buffer}
 */
async function toXLSX(tables) {
  const data = await fetchTableData(tables);
  const wb   = XLSX.utils.book_new();

  for (const [tableName, rows] of Object.entries(data)) {
    if (!rows.length) continue;
    // Flatten nested objects (e.g. JSONB columns)
    const flat = rows.map(row => {
      const out = {};
      for (const [key, val] of Object.entries(row)) {
        out[key] = typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
      }
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(flat);
    XLSX.utils.book_append_sheet(wb, ws, tableName.slice(0, 31));
  }

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Export a single student's data as a JSON buffer.
 * @param {string} studentId
 */
async function exportStudentData(studentId) {
  const studentTables = [
    'surveys', 'mood_logs', 'stress_scores', 'sleep_logs', 'lifestyle_logs',
    'journal_entries', 'appointments', 'crisis_alerts', 'goals', 'feedback',
    'weekly_reports', 'academic_records', 'attendance_logs', 'recommendations',
    'chat_messages', 'game_sessions',
  ];

  const results = {};
  for (const table of studentTables) {
    const { data } = await supabase.from(table).select('*').eq('student_id', studentId);
    results[table] = data || [];
  }

  const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', studentId).single();

  const payload = {
    exported_at: new Date().toISOString(),
    student_id:  studentId,
    profile:     profile || {},
    data:        results,
  };

  return Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');
}

/**
 * Get row counts per table for the backup dashboard.
 */
async function getTableStats() {
  const stats = await Promise.all(
    ALL_TABLES.map(async t => {
      const { count } = await supabase.from(t).select('id', { count: 'exact', head: true });
      return { table: t, rows: count || 0 };
    })
  );
  return {
    tables:        stats,
    total_records: stats.reduce((s, r) => s + r.rows, 0),
  };
}

module.exports = { fetchTableData, toJSON, toXLSX, exportStudentData, getTableStats, ALL_TABLES };