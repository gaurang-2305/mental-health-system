import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { exportCSV, exportMoodLogs, exportSleepLogs, exportSurveyResults, exportCrisisAlerts, exportUserList } from '../../utils/exportUtils';
import { useNotification } from '../../context/NotificationContext';

const ExportCard = ({ title, description, icon, onExport, loading }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '18px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }}
  >
    <div
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        background: 'rgba(79,142,247,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{description}</div>
    </div>
    <Button size="sm" onClick={onExport} loading={loading} variant="secondary">
      Export CSV
    </Button>
  </div>
);

const ExportReports = () => {
  const [loadingKey, setLoadingKey] = useState(null);
  const { success, error: notify } = useNotification();

  const withLoading = async (key, fn) => {
    setLoadingKey(key);
    try {
      await fn();
      success(`${key} exported successfully!`);
    } catch (err) {
      notify(`Export failed: ${err.message}`);
    } finally {
      setLoadingKey(null);
    }
  };

  const exports = [
    {
      key: 'Mood Logs',
      icon: '😊',
      title: 'Mood Logs',
      description: 'All student mood entries with scores, emotions, and notes',
      fn: async () => {
        const { data } = await supabase.from('mood_logs').select('*, user_profiles(full_name)').order('created_at', { ascending: false });
        exportMoodLogs(data || []);
      },
    },
    {
      key: 'Sleep Logs',
      icon: '💤',
      title: 'Sleep Logs',
      description: 'Student sleep data including duration and quality ratings',
      fn: async () => {
        const { data } = await supabase.from('sleep_logs').select('*').order('created_at', { ascending: false });
        exportSleepLogs(data || []);
      },
    },
    {
      key: 'Survey Results',
      icon: '📋',
      title: 'Survey Results',
      description: 'Daily check-in results with mood, stress, anxiety, and risk levels',
      fn: async () => {
        const { data } = await supabase.from('surveys').select('*').order('created_at', { ascending: false });
        exportSurveyResults(data || []);
      },
    },
    {
      key: 'Crisis Alerts',
      icon: '🚨',
      title: 'Crisis Alerts',
      description: 'All crisis alert records with student info and resolution status',
      fn: async () => {
        const { data } = await supabase
          .from('crisis_alerts')
          .select('*, user_profiles(full_name)')
          .order('created_at', { ascending: false });
        exportCrisisAlerts(data || []);
      },
    },
    {
      key: 'User List',
      icon: '👥',
      title: 'User List',
      description: 'All registered users with roles, contact info, and join dates',
      fn: async () => {
        const { data } = await supabase
          .from('user_profiles')
          .select('*, roles(name)')
          .order('created_at', { ascending: false });
        exportUserList(data || []);
      },
    },
    {
      key: 'Appointments',
      icon: '📅',
      title: 'Appointments',
      description: 'All appointments with student, counselor, status, and dates',
      fn: async () => {
        const { data } = await supabase
          .from('appointments')
          .select('*, user_profiles!appointments_student_id_fkey(full_name)')
          .order('created_at', { ascending: false });
        const formatted = (data || []).map((a) => ({
          Student: a.user_profiles?.full_name || 'Unknown',
          Date: a.scheduled_at,
          Status: a.status,
          Notes: a.notes || '',
        }));
        exportCSV(formatted, 'appointments');
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Export Reports</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Download platform data as CSV files for offline analysis
        </p>
      </div>

      <Alert type="info" title="Data Privacy">
        All exported data is anonymized where possible. Ensure compliance with your institution's
        data privacy policies before sharing exported files.
      </Alert>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {exports.map((exp) => (
            <ExportCard
              key={exp.key}
              title={exp.title}
              description={exp.description}
              icon={exp.icon}
              loading={loadingKey === exp.key}
              onExport={() => withLoading(exp.key, exp.fn)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ExportReports;