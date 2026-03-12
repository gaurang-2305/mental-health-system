import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Loader';
import { getRelativeTime, formatDateTime } from '../../utils/helpers';

const TYPE_CONFIG = {
  info: { icon: 'ℹ️', variant: 'primary', color: '#4f8ef7' },
  success: { icon: '✅', variant: 'success', color: '#34d399' },
  warning: { icon: '⚠️', variant: 'warning', color: '#fbbf24' },
  danger: { icon: '🚨', variant: 'danger', color: '#f87171' },
  crisis: { icon: '🆘', variant: 'danger', color: '#f87171' },
};

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const isUnread = !notification.is_read;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px',
        borderRadius: '12px',
        background: isUnread ? 'rgba(79,142,247,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isUnread ? 'rgba(79,142,247,0.2)' : 'var(--border)'}`,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      {/* Unread dot */}
      {isUnread && (
        <div
          style={{
            position: 'absolute',
            top: '18px',
            right: '16px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: config.color,
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: `${config.color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: isUnread ? 700 : 600,
            color: 'var(--text-primary)',
            marginBottom: '3px',
          }}
        >
          {notification.title || 'Notification'}
        </div>
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '8px',
          }}
        >
          {notification.message}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{ fontSize: '11px', color: 'var(--text-muted)' }}
            title={formatDateTime(notification.created_at)}
          >
            🕐 {getRelativeTime(notification.created_at)}
          </span>
          <Badge variant={config.variant} size="xs">
            {notification.type}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        {isUnread && (
          <button
            onClick={() => onMarkRead(notification.id)}
            title="Mark as read"
            style={{
              background: 'rgba(79,142,247,0.12)',
              border: '1px solid rgba(79,142,247,0.25)',
              borderRadius: '6px',
              color: '#4f8ef7',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              whiteSpace: 'nowrap',
            }}
          >
            Mark read
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          title="Delete notification"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '6px',
            color: '#f87171',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 10px',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  if (loading) return <PageLoader text="Loading notifications..." />;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: '10px',
                  background: '#f87171',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '2px 9px',
                  borderRadius: '999px',
                  verticalAlign: 'middle',
                }}
              >
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            ✓ Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span
                style={{
                  marginLeft: '6px',
                  background: filter === 'unread' ? 'rgba(255,255,255,0.25)' : '#f87171',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '999px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <Card>
          <div
            style={{
              textAlign: 'center',
              padding: '56px 24px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {filter === 'unread' ? '🎉' : '🔔'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              {filter === 'unread'
                ? 'All caught up!'
                : filter === 'read'
                ? 'No read notifications'
                : 'No notifications yet'}
            </div>
            <div style={{ fontSize: '13px' }}>
              {filter === 'unread'
                ? 'You have no unread notifications.'
                : 'Notifications from your counselor and the system will appear here.'}
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}

      {/* Info footer */}
      {notifications.length > 0 && (
        <p
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '24px',
          }}
        >
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}
    </div>
  );
};

export default Notifications;