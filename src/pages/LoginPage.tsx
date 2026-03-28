import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { LoginCredentials, UserRegistration } from '../types';

type FormMode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<FormMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Login form state
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState<UserRegistration>({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.login(loginData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (registerData.password !== registerData.password_confirm) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await authApi.register(registerData);
      setSuccess('Registration successful! Please login.');
      setMode('login');
      setRegisterData({
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
      });
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data: Record<string, string[]> } }).response;
        const errorMessages = Object.values(response.data).flat().join(', ');
        setError(errorMessages || 'Registration failed');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (): void => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Home Wallet</h1>
        <p style={styles.subtitle}>Personal Finance Management</p>

        <div style={styles.tabContainer}>
          <button
            onClick={() => setMode('login')}
            style={{
              ...styles.tab,
              ...(mode === 'login' ? styles.tabActive : {}),
            }}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              ...styles.tab,
              ...(mode === 'register' ? styles.tabActive : {}),
            }}
          >
            Register
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                style={styles.input}
                placeholder="you@example.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                style={styles.input}
                placeholder="you@example.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                name="first_name"
                value={registerData.first_name}
                onChange={handleRegisterChange}
                style={styles.input}
                placeholder="John"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={registerData.last_name}
                onChange={handleRegisterChange}
                style={styles.input}
                placeholder="Doe"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                minLength={8}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password *</label>
              <input
                type="password"
                name="password_confirm"
                value={registerData.password_confirm}
                onChange={handleRegisterChange}
                required
                minLength={8}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <p style={styles.toggleText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={toggleMode} style={styles.toggleButton}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: '2rem',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '450px',
    width: '100%',
  } as React.CSSProperties,
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: '0.5rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  tabContainer: {
    display: 'flex',
    marginBottom: '2rem',
    borderBottom: '2px solid #ecf0f1',
  } as React.CSSProperties,
  tab: {
    flex: 1,
    padding: '1rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#7f8c8d',
    transition: 'all 0.3s',
  } as React.CSSProperties,
  tabActive: {
    color: '#3498db',
    borderBottom: '2px solid #3498db',
    fontWeight: '500',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  label: {
    marginBottom: '0.5rem',
    color: '#2c3e50',
    fontWeight: '500',
  } as React.CSSProperties,
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  } as React.CSSProperties,
  button: {
    padding: '0.75rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
    marginTop: '1rem',
  } as React.CSSProperties,
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  success: {
    padding: '0.75rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  toggleText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#7f8c8d',
  } as React.CSSProperties,
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
  } as React.CSSProperties,
};

export default LoginPage;
