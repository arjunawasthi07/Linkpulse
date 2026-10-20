import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const PasswordUnlock = ({ slug }) => {
  const [password, setPassword] = useState('');
  const [gateInfo, setGateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.getGateInfo(slug);
        setGateInfo(res);
      } catch (err) {
        setError(err.message || 'Link is unavailable or does not exist.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchInfo();
  }, [slug]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password) return;

    setVerifying(true);
    setError('');
    try {
      const res = await api.unlockPasswordLink(slug, password);
      if (res.destinationUrl) {
        window.location.href = res.destinationUrl;
      }
    } catch (err) {
      setError(err.message || 'Incorrect password.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <Lock size={32} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Password Protected Link
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          This link (/{slug}) is locked by its creator. Enter the access password to continue.
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              borderRadius: '0.5rem',
              padding: '0.65rem 1rem',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock}>
          <div style={{ marginBottom: '1.25rem' }}>
            <input
              type="password"
              placeholder="Enter passcode..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoFocus
              style={{ textAlign: 'center', letterSpacing: '0.15em', fontSize: '1.1rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="gradient-btn"
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{verifying ? 'Verifying...' : 'Unlock & Redirect'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem' }}>
          <ShieldCheck size={14} />
          <span>Secured with Bcrypt Encryption via LinkPulse</span>
        </div>
      </div>
    </div>
  );
};
