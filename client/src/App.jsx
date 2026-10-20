import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { CreateLinkModal } from './components/CreateLinkModal';
import { QrCodeModal } from './components/QrCodeModal';
import { Dashboard } from './pages/Dashboard';
import { LinkAnalytics } from './pages/LinkAnalytics';
import { PasswordUnlock } from './pages/PasswordUnlock';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQrLink, setSelectedQrLink] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Handle URL path check on mount (e.g. /p/:slug for password unlock)
  const [passwordGateSlug, setPasswordGateSlug] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/p/')) {
      const slug = path.replace('/p/', '');
      if (slug) {
        setPasswordGateSlug(slug);
      }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Loading LinkPulse...
      </div>
    );
  }

  // If visitor navigated to a password gate
  if (passwordGateSlug) {
    return (
      <>
        <PasswordUnlock slug={passwordGateSlug} />
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setSelectedLinkId(null);
          setCurrentView(view);
        }}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {!isAuthenticated && currentView !== 'register' && currentView !== 'login' ? (
          /* Unauthenticated Landing / Dashboard View */
          <div style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
            <span className="badge badge-indigo" style={{ marginBottom: '1rem' }}>
              ⚡ Next-Generation URL Infrastructure
            </span>
            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
              }}
            >
              Shorten links. <span className="gradient-text">Capture intelligence.</span>
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#94a3b8',
                maxWidth: '640px',
                margin: '0 auto 2.5rem',
                lineHeight: 1.6,
              }}
            >
              LinkPulse turns complex URLs into lightning-fast short links with sub-millisecond Redis caching,
              geo-location intelligence, device detection, and real-time click stream analytics.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="gradient-btn"
                style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}
              >
                Shorten a Link Now
              </button>
              <button
                onClick={() => setCurrentView('register')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '0.85rem 1.85rem',
                  borderRadius: '0.625rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Create Free Account
              </button>
            </div>

            {/* Architecture feature badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                textAlign: 'left',
              }}
            >
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.4rem' }}>
                  ⚡ Redis 7.4 Caching
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Hot slugs are pre-cached in Redis memory for ultra-low latency 302 redirects.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
                  📊 Real-Time Analytics
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Every click captures country, city, browser, device, and referrer asynchronously.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.4rem' }}>
                  🔒 Password Protection
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Bcrypt-encrypted access gates prevent unauthorized access to sensitive links.
                </p>
              </div>
            </div>
          </div>
        ) : currentView === 'login' ? (
          <Login
            onSwitchToRegister={() => setCurrentView('register')}
            onShowToast={showToast}
            onSuccess={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'register' ? (
          <Register
            onSwitchToLogin={() => setCurrentView('login')}
            onShowToast={showToast}
            onSuccess={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'admin' ? (
          <AdminDashboard onShowToast={showToast} />
        ) : selectedLinkId ? (
          <LinkAnalytics
            linkId={selectedLinkId}
            onBack={() => setSelectedLinkId(null)}
            onShowToast={showToast}
          />
        ) : (
          <Dashboard
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onSelectLinkAnalytics={(id) => setSelectedLinkId(id)}
            onOpenQrModal={(link) => setSelectedQrLink(link)}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.85rem',
        }}
      >
        <p>
          LinkPulse · Engineered by <strong>Arjun Awasthi</strong> · Built with Node.js, Express, PostgreSQL, Redis & React
        </p>
      </footer>

      {/* Modals */}
      <CreateLinkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onLinkCreated={() => {}}
        onShowToast={showToast}
      />

      <QrCodeModal
        link={selectedQrLink}
        isOpen={!!selectedQrLink}
        onClose={() => setSelectedQrLink(null)}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
