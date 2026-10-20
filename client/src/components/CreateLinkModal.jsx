import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { X, Lock, Calendar, Globe, Sparkles, Copy, Check, QrCode } from 'lucide-react';

export const CreateLinkModal = ({ isOpen, onClose, onLinkCreated, onShowToast }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    setLoading(true);
    try {
      const payload = {
        originalUrl,
        customSlug: customSlug || undefined,
        title: title || undefined,
        password: enablePassword && password ? password : undefined,
        expiresAt: expiresAt || undefined,
      };

      const res = await api.createLink(payload);
      setCreatedResult(res.link);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      onLinkCreated(res.link);
      onShowToast('Link created successfully!', 'success');
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    onShowToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAndClose = () => {
    setOriginalUrl('');
    setCustomSlug('');
    setTitle('');
    setEnablePassword(false);
    setPassword('');
    setExpiresAt('');
    setCreatedResult(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 8, 16, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '2rem',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <button
          onClick={handleResetAndClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {createdResult ? (
          /* Success Screen */
          <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Sparkles size={28} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Your link is ready!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Shortened with real-time analytics and geo-tracking enabled.
            </p>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '0.75rem',
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: '#38bdf8',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {createdResult.shortUrl}
              </span>
              <button
                onClick={() => handleCopy(createdResult.shortUrl)}
                className="gradient-btn"
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {createdResult.qrCode && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img
                  src={createdResult.qrCode}
                  alt="QR Code"
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '0.5rem',
                    margin: '0 auto',
                    border: '4px solid white',
                  }}
                />
              </div>
            )}

            <button
              onClick={handleResetAndClose}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.625rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Create Form */
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Create Short Link
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Generate an optimized short link with custom slug and security options.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Destination URL */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
                  Destination URL <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/my-long-article-url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Globe
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

              {/* Title & Custom Slug in 2 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
                    Title / Campaign (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer Launch"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
                    Custom Alias (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. promo-2026"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    className="input-field"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              {/* Password Protection Gate */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enablePassword ? '0.75rem' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} color={enablePassword ? '#a5b4fc' : '#64748b'} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>
                      Password Protection Gate
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.checked)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#6366f1' }}
                  />
                </div>

                {enablePassword && (
                  <div>
                    <input
                      type="password"
                      placeholder="Enter secret passcode for link"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.875rem', padding: '0.6rem 0.85rem' }}
                    />
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                      Visitors will be prompted to enter this password before redirecting.
                    </p>
                  </div>
                )}
              </div>

              {/* Expiration Date */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
                  Expiration Date (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Calendar
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

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.625rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-btn"
                  style={{ flex: 2, padding: '0.75rem' }}
                >
                  {loading ? 'Creating...' : 'Generate Short Link'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
