import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi, tokenManager } from '../api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = tokenManager.isAuthenticated();

  const handleLogout = async (): Promise<void> => {
    try {
      await authApi.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      tokenManager.clearTokens();
      navigate('/login');
    }
  };

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <div style={styles.container}>
      {isAuthenticated && (
        <nav style={styles.nav}>
          <div style={styles.navContent}>
            <h1 style={styles.logo}>Home Wallet</h1>
            <div style={styles.navLinks}>
              <Link
                to="/dashboard"
                style={{
                  ...styles.navLink,
                  ...(isActive('/dashboard') ? styles.navLinkActive : {}),
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                style={{
                  ...styles.navLink,
                  ...(isActive('/transactions') ? styles.navLinkActive : {}),
                }}
              >
                Transactions
              </Link>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  } as React.CSSProperties,
  nav: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  logo: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  } as React.CSSProperties,
  navLinks: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  } as React.CSSProperties,
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  } as React.CSSProperties,
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  } as React.CSSProperties,
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  } as React.CSSProperties,
};

export default Layout;
