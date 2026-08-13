import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCustomer } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { saveRole } from '../../utils/role';
import { ROUTES } from '../../constants/routes';
import './Login.css';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !phone || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await registerCustomer({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      saveRole('customer');
      login(res.token, res.customer);
      navigate(ROUTES.CUSTOMER_PROFILE, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card auth-card--register">
        <h1 className="auth-card__title">Customer Registration</h1>

        {error && (
          <div
            className="auth-alert-error"
            role="alert"
            aria-live="polite"
            id="register-error-alert"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-grid-2col">
            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reg-firstname" className="auth-form-label">
                First Name
              </label>
              <input
                id="reg-firstname"
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="Ahmed"
                value={formData.firstName}
                onChange={handleChange}
                className="auth-form-input"
                aria-invalid={error ? 'true' : 'false'}
                required
              />
            </div>

            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reg-lastname" className="auth-form-label">
                Last Name
              </label>
              <input
                id="reg-lastname"
                type="text"
                name="lastName"
                autoComplete="family-name"
                placeholder="Ali"
                value={formData.lastName}
                onChange={handleChange}
                className="auth-form-input"
                aria-invalid={error ? 'true' : 'false'}
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-email" className="auth-form-label">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="student@university.edu"
              value={formData.email}
              onChange={handleChange}
              className="auth-form-input"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'register-error-alert' : undefined}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-phone" className="auth-form-label">
              Phone Number
            </label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="+201000000000"
              value={formData.phone}
              onChange={handleChange}
              className="auth-form-input"
              aria-invalid={error ? 'true' : 'false'}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-password" className="auth-form-label">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="auth-form-input"
              aria-invalid={error ? 'true' : 'false'}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-confirm-password" className="auth-form-label">
              Confirm Password
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="auth-form-input"
              aria-invalid={error ? 'true' : 'false'}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to={ROUTES.CUSTOMER_LOGIN} className="auth-footer-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
