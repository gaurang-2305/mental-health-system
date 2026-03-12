import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { downloadFile } from '../../utils/exportUtils';
import { useNotification } from '../../context/NotificationContext';

const BackupRecovery = () => {
  const [creating, setCreating] = useState(false);
  const [backups, setBackups] = useState([]);
  const { success, error: notify, warning } = useNotification();

  const createBackup = async () => {
    setCreating(true);
    try {
      // Fetch all key tables
      const [
        { data: moods },
        { data: surveys },
        { data: journals },
        { data: goals },
        { data: appointments },
        { data: sleep },
      ] = await Promise.all([
        supabase.from('mood_logs').select('*').limit(1000),
        supabase.from('surveys').select('*').limit(1000),
        supabase.from('journal_entries').select('*').limit(1000),
        supabase.from('goals').select('*').limit(1000),
        supabase.from('appointments').select('*').limit(1000),
        supabase.from('sleep_logs').select('*').limit(1000),
      ]);

      const backup = {
        created_at: new Date().toISOString(),
        version: '1.0',
        data: {
          mood_logs: moods || [],
          surveys: surveys || [],
          journal_entries: journals || [],
          goals: goals || [],
          appointments: appointments || [],
          sleep_logs: sleep || [],
        },
        meta: {
          total_records:
            (moods?.length || 0) +
            (surveys?.length || 0) +
            (journals?.length || 0) +
            (goals?.length || 0) +
            (appointments?.length || 0) +
            (sleep?.length || 0),
        },
      };

      const filename = `mindcare_backup_${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(JSON.stringify(backup, null, 2), filename, 'application/json');

      const newBackup = {
        id: Date.now(),
        name: filename,
        size: `${(JSON.stringify(backup).length / 1024).toFixed(1)} KB`,
        records: backup.meta.total_records,
        created_at: new Date().toISOString(),
      };
      setBackups((prev) => [newBackup, ...prev]);
      success('Backup created and downloaded successfully!');
    } catch (err) {
      notify(`Backup failed: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const tables = [
    { name: 'mood_logs', label: 'Mood Logs', icon: '😊' },
    { name: 'surveys', label: 'Surveys', icon: '📋' },
    { name: 'sleep_logs', label: 'Sleep Logs', icon: '💤' },
    { name: 'journal_entries', label: 'Journal Entries', icon: '📝' },
    { name: 'goals', label: 'Goals', icon: '🎯' },
    { name: 'appointments', label: 'Appointments', icon: '📅' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Backup & Recovery</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Create and manage data backups
        </p>
      </div>

      <Alert type="warning" title="Important">
        Backups include sensitive student data. Store them securely and comply with your institution's
        data retention policies. Restore operations should only be performed by authorized personnel.
      </Alert>

      {/* Create backup */}
      <Card title="Create Backup" subtitle="Export all platform data to a JSON file" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          {tables.map((t) => (
            <div
              key={t.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(79,142,247,0.1)',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#4f8ef7',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
        <Button onClick={createBackup} loading={creating} icon="💾">
          {creating ? 'Creating backup...' : 'Create & Download Backup'}
        </Button>
      </Card>

      {/* Backup history */}
      <Card title="Backup History" subtitle="Backups created in this session">
        {backups.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px', fontSize: '14px' }}>
            No backups created yet. Create your first backup above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {backups.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    💾 {b.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {b.records} records · {b.size} · {new Date(b.created_at).toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#34d399',
                    background: 'rgba(52,211,153,0.15)',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontWeight: 600,
                  }}
                >
                  ✓ Downloaded
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Restore note */}
      <Card title="Restore Data" style={{ marginTop: '20px' }}>
        <Alert type="info">
          Data restoration requires direct Supabase dashboard access. Contact your system administrator
          or use the Supabase dashboard to restore from a backup file.
        </Alert>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          🔗 Open Supabase Dashboard
        </a>
      </Card>
    </div>
  );
};

export default BackupRecovery;