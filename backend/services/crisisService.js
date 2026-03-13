const supabase = require('../config/supabase');
const { createNotification, notifyAllCounselors } = require('./notificationService');
const logger   = require('../utils/index');

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'self-harm', 'hurt myself', 'cut myself', 'overdose', 'no reason to live',
  'can\'t go on', 'give up on life', 'ending it all',
];

/**
 * Check text for crisis keywords.
 * Returns { isCrisis: boolean, matchedKeywords: string[] }
 */
function detectCrisisKeywords(text) {
  const lower         = text.toLowerCase();
  const matchedKeywords = CRISIS_KEYWORDS.filter(kw => lower.includes(kw));
  return { isCrisis: matchedKeywords.length > 0, matchedKeywords };
}

/**
 * Create a crisis alert and notify available counselors.
 *
 * @param {string} studentId
 * @param {string} riskLevel    — 'high' | 'critical'
 * @param {string} triggerReason
 * @param {string} [studentName]
 */
async function raiseCrisisAlert(studentId, riskLevel, triggerReason, studentName = 'A student') {
  try {
    // Find an available counselor (round-robin: least recently assigned)
    const { data: counselors } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role_id', 2)
      .limit(5);

    // Pick counselor with fewest open alerts
    let assignedCounselorId = null;
    if (counselors?.length) {
      const counts = await Promise.all(counselors.map(async c => {
        const { count } = await supabase
          .from('crisis_alerts')
          .select('id', { count: 'exact', head: true })
          .eq('alerted_counselor_id', c.id)
          .eq('is_resolved', false);
        return { id: c.id, count: count || 0 };
      }));
      counts.sort((a, b) => a.count - b.count);
      assignedCounselorId = counts[0].id;
    }

    const { data: alert, error } = await supabase
      .from('crisis_alerts')
      .insert({
        student_id:           studentId,
        risk_level:           riskLevel,
        trigger_reason:       triggerReason,
        alerted_counselor_id: assignedCounselorId,
      })
      .select()
      .single();

    if (error) {
      logger.error(`raiseCrisisAlert DB error: ${error.message}`);
      return null;
    }

    // Notify assigned counselor
    if (assignedCounselorId) {
      await createNotification({
        user_id: assignedCounselorId,
        title:   `⚠ Crisis Alert — ${riskLevel.toUpperCase()}`,
        message: `${studentName} needs immediate attention. Reason: ${triggerReason}`,
        type:    'crisis_alert',
      });
    } else {
      // No counselor available — notify all
      await notifyAllCounselors(
        `⚠ Unassigned Crisis Alert — ${riskLevel.toUpperCase()}`,
        `${studentName} needs immediate attention. Reason: ${triggerReason}`,
        'crisis_alert'
      );
    }

    logger.warn(`Crisis alert raised for student ${studentId}: ${riskLevel} — ${triggerReason}`);
    return alert;
  } catch (err) {
    logger.error(`raiseCrisisAlert exception: ${err.message}`);
    return null;
  }
}

/**
 * Evaluate a numeric risk score and raise an alert if needed.
 * Called after survey submissions, stress score saves, etc.
 *
 * @param {string} studentId
 * @param {number} stressScore   0–100
 * @param {string} [studentName]
 * @param {string} [source]      — e.g. 'survey', 'stress_tracker'
 */
async function evaluateRisk(studentId, stressScore, studentName = 'Student', source = 'system') {
  let riskLevel;
  if      (stressScore >= 75) riskLevel = 'critical';
  else if (stressScore >= 55) riskLevel = 'high';
  else                        return null; // no alert needed

  // Avoid duplicate alerts within 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('crisis_alerts')
    .select('id')
    .eq('student_id', studentId)
    .eq('is_resolved', false)
    .gte('created_at', oneHourAgo)
    .limit(1);

  if (existing?.length) {
    logger.info(`Skipping duplicate crisis alert for student ${studentId}`);
    return null;
  }

  return raiseCrisisAlert(
    studentId,
    riskLevel,
    `${source}: stress score ${stressScore.toFixed(0)}`,
    studentName
  );
}

/**
 * Get open (unresolved) crisis alert count — used in admin dashboard.
 */
async function getOpenAlertCount() {
  const { count } = await supabase
    .from('crisis_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('is_resolved', false);
  return count || 0;
}

module.exports = { detectCrisisKeywords, raiseCrisisAlert, evaluateRisk, getOpenAlertCount };