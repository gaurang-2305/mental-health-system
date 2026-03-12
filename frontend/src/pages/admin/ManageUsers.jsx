import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Loader';
import { formatDate, getInitials, stringToColor } from '../../utils/helpers';

const ROLE_BADGES = {
  student: 'primary',
  counselor: 'success',
  admin: 'danger',
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, roles(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.roles?.name === roleFilter;
    return matchSearch && matchRole;
  });

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  if (loading) return <PageLoader text="Loading users..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Manage Users</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {users.length} registered users
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix="🔍"
            containerStyle={{ marginBottom: 0 }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            padding: '10px 14px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="counselor">Counselors</option>
          <option value="admin">Admins</option>
        </select>
        <Button variant="secondary" onClick={fetchUsers} icon="🔄">
          Refresh
        </Button>
      </div>

      {/* Users table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['User', 'Role', 'Class', 'Phone', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const initials = getInitials(user.full_name);
                const avatarColor = stringToColor(user.full_name);
                const role = user.roles?.name || 'student';

                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: avatarColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#fff',
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {user.full_name || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={ROLE_BADGES[role] || 'default'}>
                        {role}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {user.class_year || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {user.phone || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Button size="sm" variant="secondary" onClick={() => handleViewUser(user)}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '14px',
                    }}
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User detail modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="User Details"
        size="sm"
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: stringToColor(selectedUser.full_name),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 auto 12px',
                }}
              >
                {getInitials(selectedUser.full_name)}
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px' }}>{selectedUser.full_name}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                {selectedUser.email}
              </p>
            </div>
            {[
              { label: 'Role', value: selectedUser.roles?.name || 'student' },
              { label: 'Age', value: selectedUser.age || '—' },
              { label: 'Class/Year', value: selectedUser.class_year || '—' },
              { label: 'Phone', value: selectedUser.phone || '—' },
              { label: 'Language', value: selectedUser.preferred_language || 'English' },
              { label: 'Joined', value: formatDate(selectedUser.created_at) },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;