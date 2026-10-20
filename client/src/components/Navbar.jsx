import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Shield, LogOut, User, PlusCircle, Link as LinkIcon } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, onOpenCreateModal }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.875rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentView('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Activity size={20} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              Link<span style={{ color: '#6366f1' }}>Pulse</span>
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenCreateModal}
                className="gradient-btn"
                style={{
                  padding: '0.55rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.875rem',
                }}
              >
                <PlusCircle size={16} />
                <span>Shorten URL</span>
              </button>

              <button
                onClick={() => setCurrentView('dashboard')}
                style={{
                  background: currentView === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: currentView === 'dashboard' ? '#a5b4fc' : '#94a3b8',
                  border: '1px solid',
                  borderColor: currentView === 'dashboard' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <LinkIcon size={15} />
                <span>Links</span>
              </button>

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  style={{
                    background: currentView === 'admin' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
                    color: currentView === 'admin' ? '#fda4af' : '#94a3b8',
                    border: '1px solid',
                    borderColor: currentView === 'admin' ? 'rgba(244, 63, 94, 0.3)' : 'transparent',
                    padding: '0.55rem 0.95rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Shield size={15} />
                  <span>Admin Panel</span>
                </button>
              )}

              {/* User Dropdown / Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  paddingLeft: '0.5rem',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#e2e8f0',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a5b4fc',
                    }}
                  >
                    <User size={15} />
                  </div>
                  <span style={{ fontWeight: 600 }}>{user?.name || 'Account'}</span>
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setCurrentView('login')}
                style={{
                  background: 'transparent',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="gradient-btn"
                style={{
                  padding: '0.5rem 1.15rem',
                  fontSize: '0.875rem',
                }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
