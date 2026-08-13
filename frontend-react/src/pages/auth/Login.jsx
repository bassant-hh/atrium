import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginCustomer } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { saveRole } from '../../utils/role';
import { ROUTES } from '../../constants/routes';
import './Login.css';

const getSafeRedirectPath = (fromState) => {
  if (typeof fromState !== 'string') return ROUTES.CUSTOMER_PROFILE;

  // Prevent open redirect vulnerabilities (must start with single slash, not //)
  if (!fromState.startsWith('/') || fromState.startsWith('//')) {
    return ROUTES.CUSTOMER_PROFILE;
  }

  // Do not redirect back to authentication pages
  const forbiddenAuthPaths = [
    ROUTES.CUSTOMER_LOGIN,
    ROUTES.CUSTOMER_REGISTER,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.PORTAL,
  ];

  if (forbiddenAuthPaths.some((path) => fromState.startsWith(path))) {
    return ROUTES.CUSTOMER_PROFILE;
  }

  return fromState;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await loginCustomer({ email, password });
      saveRole('customer');
      login(res.token, res.customer);

      const targetPath = getSafeRedirectPath(location.state?.from);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h1 className="auth-card__title">Customer Login</h1>

        {error && (
          <div className="auth-alert-error" role="alert" aria-live="polite" id="login-error-alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form-group">
            <label htmlFor="customer-email" className="auth-form-label">
              Email Address
            </label>
            <input
              id="customer-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-form-input"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'login-error-alert' : undefined}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="customer-password" className="auth-form-label">
              Password
            </label>
            <input
              id="customer-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-form-input"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'login-error-alert' : undefined}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to={ROUTES.CUSTOMER_REGISTER} className="auth-footer-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
