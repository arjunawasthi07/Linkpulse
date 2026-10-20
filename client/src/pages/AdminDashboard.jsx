import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Shield, Users, Link as LinkIcon, MousePointerClick, Database, Trash2, ExternalLink } from 'lucide-react';

export const AdminDashboard = ({ onShowToast }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, linksRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminLinks(),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setLinks(linksRes.links || []);
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their links?')) return;
    try {
      await api.deleteAdminUser(id);
      setUsers(users.filter((u) => u.id !== id));
      onShowToast('User deleted successfully.', 'success');
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      await api.deleteLink(id);
      setLinks(links.filter((l) => l.id !== id));
      onShowToast('Link deleted.', 'success');
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  if (loading && !stats) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading Admin Panel...</div>;
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Administration</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            System health, active database connections, users, and moderation controls.
          </p>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Registered Users</span>
            <Users size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats?.totalUsers ?? 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Platform Links</span>
            <LinkIcon size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats?.totalLinks ?? 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Platform Clicks Tracked</span>
            <MousePointerClick size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats?.totalClicks ?? 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Redis Cache Ingestion</span>
            <Database size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#6ee7b7' }}>
            {stats?.redisConnected ? 'Operational' : 'Fallback Active'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PostgreSQL 17 & Redis 7.4</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '0.5rem',
            background: activeTab === 'users' ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('links')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '0.5rem',
            background: activeTab === 'links' ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          All Links ({links.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {activeTab === 'users' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Links Count</th>
                <th style={{ padding: '0.75rem' }}>Joined</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={u.role === 'ADMIN' ? 'badge badge-rose' : 'badge badge-indigo'}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{u._count?.links ?? 0}</td>
                  <td style={{ padding: '0.75rem', color: '#64748b' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem' }}>Slug</th>
                <th style={{ padding: '0.75rem' }}>Original Destination</th>
                <th style={{ padding: '0.75rem' }}>Owner</th>
                <th style={{ padding: '0.75rem' }}>Clicks</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                    /{l.slug}
                  </td>
                  <td style={{ padding: '0.75rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={l.originalUrl} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                      {l.originalUrl}
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>
                    {l.user ? l.user.name : 'Guest'}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>{l.totalClicks}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={l.isActive ? 'badge badge-emerald' : 'badge badge-rose'}>
                      {l.isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleDeleteLink(l.id)}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                      title="Delete Link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
