// Module 27
export async function createBackup() {
  // Create system backup
  return { success: true };
}

export async function restoreBackup(backupId) {
  // Restore from backup
  return { success: true };
}
const cron   = require('node-cron');
const path   = require('path');
const fs     = require('fs');
const { toJSON, toXLSX } = require('./exportService');
const { generateAllReports }  = require('./reportService');
const { sendSurveyReminders } = require('./notificationService');
const logger = require('../utils/index');

const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// ─── Backup helpers ───────────────────────────────────────────────────────────

/**
 * Write a full JSON backup to disk and return the filepath.
 */
async function runJSONBackup() {
  try {
    const buf      = await toJSON();
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(filepath, buf);
    logger.info(`JSON backup saved: ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);

    // Keep only the 7 most recent backups
    pruneBackups('.json', 7);

    return filepath;
  } catch (err) {
    logger.error(`JSON backup failed: ${err.message}`);
    throw err;
  }
}

/**
 * Write a full XLSX backup to disk.
 */
async function runXLSXBackup() {
  try {
    const buf      = await toXLSX();
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
    const filepath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(filepath, buf);
    logger.info(`XLSX backup saved: ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);

    pruneBackups('.xlsx', 3);

    return filepath;
  } catch (err) {
    logger.error(`XLSX backup failed: ${err.message}`);
    throw err;
  }
}

/**
 * Remove old backup files, keeping only the `keep` most recent.
 */
function pruneBackups(ext, keep = 7) {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith(ext))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    files.slice(keep).forEach(f => {
      fs.unlinkSync(path.join(BACKUP_DIR, f.name));
      logger.info(`Pruned old backup: ${f.name}`);
    });
  } catch (err) {
    logger.warn(`Backup pruning failed: ${err.message}`);
  }
}

/**
 * List available backup files.
 */
function listBackups() {
  try {
    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json') || f.endsWith('.xlsx'))
      .map(f => {
        const stat = fs.statSync(path.join(BACKUP_DIR, f));
        return { filename: f, size_kb: (stat.size / 1024).toFixed(1), created_at: stat.mtime };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch {
    return [];
  }
}

// ─── Cron jobs ────────────────────────────────────────────────────────────────

function startCronJobs() {
  if (process.env.NODE_ENV === 'test') return;

  // Daily backup at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Cron: daily backup starting');
    await runJSONBackup().catch(err => logger.error(`Cron backup error: ${err.message}`));
  });

  // Weekly XLSX backup every Sunday at 3:00 AM
  cron.schedule('0 3 * * 0', async () => {
    logger.info('Cron: weekly XLSX backup starting');
    await runXLSXBackup().catch(err => logger.error(`Cron XLSX backup error: ${err.message}`));
  });

  // Weekly reports — every Monday at 6:00 AM
  cron.schedule('0 6 * * 1', async () => {
    logger.info('Cron: generating weekly reports for all students');
    const count = await generateAllReports().catch(err => {
      logger.error(`Cron report generation error: ${err.message}`);
      return 0;
    });
    logger.info(`Cron: ${count} weekly reports generated`);
  });

  // Survey reminders — every Monday and Thursday at 9:00 AM
  cron.schedule('0 9 * * 1,4', async () => {
    logger.info('Cron: sending survey reminders');
    const count = await sendSurveyReminders(7).catch(err => {
      logger.error(`Cron survey reminder error: ${err.message}`);
      return 0;
    });
    logger.info(`Cron: ${count} survey reminders sent`);
  });

  logger.info('Cron jobs scheduled: backup (daily 2am), xlsx (weekly Sun 3am), reports (Mon 6am), reminders (Mon+Thu 9am)');
}

module.exports = { runJSONBackup, runXLSXBackup, listBackups, pruneBackups, startCronJobs };