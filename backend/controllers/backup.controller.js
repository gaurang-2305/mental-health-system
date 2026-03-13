const supabase = require('../config/supabase');
const XLSX     = require('xlsx');
const path     = require('path');
const fs       = require('fs');

const EXPORT_DIR = path.join(__dirname, '../exports');
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

// GET /api/backup/export  (admin only)
async function exportData(req, res, next) {
  try {
    const { tables: reqTables, format = 'json' } = req.query;

    const allTables = [
      'user_profiles', 'surveys', 'mood_logs', 'stress_scores',
      'sleep_logs', 'lifestyle_logs', 'journal_entries', 'appointments',
      'crisis_alerts', 'forum_posts', 'goals', 'feedback', 'weekly_reports',
      'academic_records', 'attendance_logs', 'recommendations',
    ];

    const tablesToExport = reqTables
      ? reqTables.split(',').filter(t => allTables.includes(t))
      : allTables;

    const exportData = {};
    for (const table of tablesToExport) {
      const { data, error } = await supabase.from(table).select('*').limit(10000);
      exportData[table] = error ? [] : data;
    }

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();

      for (const [tableName, rows] of Object.entries(exportData)) {
        if (!rows.length) continue;
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, tableName.slice(0, 31)); // Excel sheet name max 31 chars
      }

      const filename = `mindcare_backup_${Date.now()}.xlsx`;
      const filepath = path.join(EXPORT_DIR, filename);
      XLSX.writeFile(wb, filepath);

      res.download(filepath, filename, () => {
        // Clean up after send
        try { fs.unlinkSync(filepath); } catch {}
      });
    } else {
      // JSON export
      const json     = JSON.stringify({ exported_at: new Date().toISOString(), data: exportData }, null, 2);
      const filename = `mindcare_backup_${Date.now()}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      res.send(json);
    }
  } catch (err) { next(err); }
}

// GET /api/backup/tables  — list available tables & row counts
async function getTableStats(req, res, next) {
  try {
    const tables = [
      'user_profiles', 'surveys', 'mood_logs', 'stress_scores',
      'sleep_logs', 'lifestyle_logs', 'journal_entries', 'appointments',
      'notifications', 'crisis_alerts', 'forum_posts', 'forum_replies',
      'goals', 'feedback', 'weekly_reports', 'academic_records',
      'attendance_logs', 'game_sessions', 'recommendations', 'chat_messages',
    ];

    const stats = await Promise.all(
      tables.map(async t => {
        const { count } = await supabase.from(t).select('id', { count: 'exact', head: true });
        return { table: t, rows: count || 0 };
      })
    );

    res.json({ tables: stats, total_records: stats.reduce((s, r) => s + r.rows, 0) });
  } catch (err) { next(err); }
}

module.exports = { exportData, getTableStats };