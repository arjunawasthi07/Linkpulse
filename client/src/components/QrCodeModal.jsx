import React, { useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';

export const QrCodeModal = ({ link, isOpen, onClose, onShowToast }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !link) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    onShowToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!link.qrCode) return;
    const a = document.createElement('a');
    a.href = link.qrCode;
    a.download = `linkpulse-qr-${link.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('QR Code downloaded!', 'success');
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
          maxWidth: '420px',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '2rem',
          position: 'relative',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <button
          onClick={onClose}
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

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          QR Code
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Scan to visit <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>/{link.slug}</span>
        </p>

        {link.qrCode ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <img
              src={link.qrCode}
              alt="QR Code"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '0.75rem',
                margin: '0 auto',
                border: '6px solid white',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        ) : (
          <div style={{ padding: '2rem', color: '#94a3b8' }}>Generating QR...</div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="gradient-btn"
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={16} />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
