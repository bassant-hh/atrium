import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginCustomer } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await loginCustomer({ email, password });
      login(res.token, res.customer);
      navigate('/customer/profile');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '40px auto',
        padding: '32px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>Customer Login</h2>

      {error && (
        <div
          style={{
            color: '#ba1a1a',
            backgroundColor: '#ffdad6',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555' }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="student@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555' }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: '#3b889d',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
        Don't have an account?{' '}
        <Link
          to="/customer/register"
          style={{ color: '#3b889d', fontWeight: 'bold', textDecoration: 'none' }}
        >
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
