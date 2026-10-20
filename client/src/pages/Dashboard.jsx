import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Link as LinkIcon,
  MousePointerClick,
  TrendingUp,
  Search,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  BarChart2,
  Trash2,
  Lock,
  Plus,
  Power,
} from 'lucide-react';

export const Dashboard = ({ onOpenCreateModal, onSelectLinkAnalytics, onOpenQrModal, onShowToast }) => {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [linksRes, summaryRes] = await Promise.all([
        api.getUserLinks({ search: search || undefined }),
        api.getUserSummary(),
      ]);
      setLinks(linksRes.links || []);
      setSummary(summaryRes.stats || null);
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleCopy = (id, shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    onShowToast('Short link copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (link) => {
    try {
      const updated = await api.updateLink(link.id, { isActive: !link.isActive });
      setLinks(links.map((l) => (l.id === link.id ? { ...l, isActive: updated.link.isActive } : l)));
      onShowToast(
        `Link ${updated.link.isActive ? 'activated' : 'paused'} successfully!`,
        'success'
      );
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link and its analytics?')) return;
    try {
      await api.deleteLink(id);
      setLinks(links.filter((l) => l.id !== id));
      onShowToast('Link deleted successfully.', 'success');
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Welcome back, <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Manage your links, review real-time click analytics, and track traffic performance.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="gradient-btn"
          style={{
            padding: '0.75rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
          }}
        >
          <Plus size={18} />
          <span>Create New Link</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Short Links</span>
            <LinkIcon size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#ffffff' }}>
            {summary?.totalLinks ?? links.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Links in your account</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Clicks</span>
            <MousePointerClick size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#ffffff' }}>
            {summary?.totalClicks ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>All-time aggregate clicks</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Clicks (Past 7 Days)</span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#ffffff' }}>
            {summary?.clicksLast7Days ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Active traffic stream</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Engine Performance</span>
            <span className="badge badge-emerald">Redis 7.4</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: '#6ee7b7' }}>
            Instant Caching
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sub-millisecond redirects</span>
        </div>
      </div>

      {/* Link Management Section */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your Active Links</h2>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Search by slug, title or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Loading links and analytics...
          </div>
        ) : links.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <LinkIcon size={30} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No shortened links found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {search ? 'Try clearing your search query' : 'Create your very first trackable short link now.'}
            </p>
            {!search && (
              <button onClick={onOpenCreateModal} className="gradient-btn" style={{ padding: '0.65rem 1.35rem' }}>
                Create First Link
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {links.map((link) => (
              <div
                key={link.id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                }}
              >
                {/* Link Info */}
                <div style={{ flex: '1 1 300px', minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#f8fafc',
                      }}
                    >
                      {link.title || `/${link.slug}`}
                    </span>

                    {link.isPasswordProtected && (
                      <span className="badge badge-amber" title="Password Protected Link">
                        <Lock size={12} />
                        <span>Passcode</span>
                      </span>
                    )}

                    {!link.isActive && (
                      <span className="badge badge-rose" title="Link is currently paused">
                        Paused
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#38bdf8',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <span>{link.shortUrl}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <p
                    style={{
                      color: '#64748b',
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '480px',
                    }}
                    title={link.originalUrl}
                  >
                    ↳ {link.originalUrl}
                  </p>
                </div>

                {/* Metrics & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Total clicks pill */}
                  <div
                    onClick={() => onSelectLinkAnalytics(link.id)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    title="View Analytics"
                  >
                    <BarChart2 size={16} color="#818cf8" />
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                        {link.totalClicks}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>clicks</div>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(link.id, link.shortUrl)}
                    style={{
                      background: copiedId === link.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid',
                      borderColor: copiedId === link.id ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                      color: copiedId === link.id ? '#6ee7b7' : '#ffffff',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {copiedId === link.id ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copiedId === link.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  {/* QR Code Button */}
                  <button
                    onClick={() => onOpenQrModal(link)}
                    title="View QR Code"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      padding: '0.6rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <QrCode size={16} />
                  </button>

                  {/* Analytics button */}
                  <button
                    onClick={() => onSelectLinkAnalytics(link.id)}
                    className="gradient-btn"
                    style={{
                      padding: '0.6rem 0.95rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <BarChart2 size={15} />
                    <span>Analytics</span>
                  </button>

                  {/* Toggle Active / Pause */}
                  <button
                    onClick={() => handleToggleActive(link)}
                    title={link.isActive ? 'Pause Link' : 'Activate Link'}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: link.isActive ? '#10b981' : '#64748b',
                      cursor: 'pointer',
                      padding: '0.4rem',
                    }}
                  >
                    <Power size={18} />
                  </button>

                  {/* Delete Link */}
                  <button
                    onClick={() => handleDelete(link.id)}
                    title="Delete Link"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f43f5e',
                      opacity: 0.7,
                      cursor: 'pointer',
                      padding: '0.4rem',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
