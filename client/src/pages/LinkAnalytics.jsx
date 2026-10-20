import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { LineChart, DonutChart, HorizontalBarChart } from '../components/Charts';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  MousePointerClick,
  Users,
  Clock,
  Globe,
  Smartphone,
  Compass,
  Layers,
} from 'lucide-react';

export const LinkAnalytics = ({ linkId, onBack, onShowToast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getLinkAnalytics(linkId, range);
      setData(res);
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (linkId) {
      fetchAnalytics();
    }
  }, [linkId, range]);

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    onShowToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !data) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading real-time analytics data...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#f43f5e', marginBottom: '1rem' }}>Failed to load analytics.</p>
        <button onClick={onBack} className="gradient-btn" style={{ padding: '0.5rem 1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { link, summary, timeline, devices, browsers, operatingSystems, countries, referrers, recentClicks } = data;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {link.title || `/${link.slug}`}
            </h1>
            <span className="badge badge-indigo">Live Analytics</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600 }}>
              {link.shortUrl}
            </span>
            <button
              onClick={() => handleCopy(link.shortUrl)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: copied ? '#6ee7b7' : '#ffffff',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                textDecoration: 'none',
              }}
            >
              <span>Test Redirect</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            ↳ Destination: <span style={{ color: '#94a3b8' }}>{link.originalUrl}</span>
          </p>
        </div>

        {/* Range Selector */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '0.625rem',
            padding: '0.3rem',
            display: 'flex',
            gap: '0.25rem',
          }}
        >
          {['24h', '7d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                background: range === r ? '#6366f1' : 'transparent',
                color: range === r ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.45rem',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Clicks</span>
            <MousePointerClick size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#ffffff' }}>
            {summary.totalClicks}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cumulative lifetime hits</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Period Clicks ({range.toUpperCase()})</span>
            <Clock size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#38bdf8' }}>
            {summary.rangeClicks}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hits in selected timeframe</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Unique Visitors</span>
            <Users size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#10b981' }}>
            {summary.uniqueVisitors}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Unique IP addresses recorded</span>
        </div>
      </div>

      {/* Clicks Timeline Chart */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Clicks Over Time</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Real-time activity progression throughout the selected period.
          </p>
        </div>
        <LineChart data={timeline} height={260} />
      </div>

      {/* 2x2 Analytics Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Device Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Smartphone size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Device Breakdown</h3>
          </div>
          <DonutChart items={devices} />
        </div>

        {/* Top Referrers */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Compass size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Top Referrers</h3>
          </div>
          <HorizontalBarChart items={referrers} color="#38bdf8" />
        </div>

        {/* Operating Systems & Browsers */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={18} color="#10b981" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Browsers & Platforms</h3>
          </div>
          <HorizontalBarChart items={browsers} color="#10b981" />
        </div>

        {/* Geographic Locations */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Globe size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Geographic Locations</h3>
          </div>
          <HorizontalBarChart items={countries} color="#f59e0b" />
        </div>
      </div>

      {/* Recent Click Stream Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Real-Time Click Stream
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Last 50 visitor redirect events captured by the ingestion engine.
        </p>

        {recentClicks.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No click events logged yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem' }}>Country</th>
                  <th style={{ padding: '0.75rem' }}>Device</th>
                  <th style={{ padding: '0.75rem' }}>Browser</th>
                  <th style={{ padding: '0.75rem' }}>Referrer</th>
                  <th style={{ padding: '0.75rem' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {recentClicks.map((click) => (
                  <tr
                    key={click.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      color: '#cbd5e1',
                    }}
                  >
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {new Date(click.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{click.country || 'Unknown'}</td>
                    <td style={{ padding: '0.75rem' }}>{click.device || 'Desktop'}</td>
                    <td style={{ padding: '0.75rem' }}>{click.browser || 'Unknown'}</td>
                    <td style={{ padding: '0.75rem', color: '#38bdf8' }}>{click.referrer || 'Direct'}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      {click.ip || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
