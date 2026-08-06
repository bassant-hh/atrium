import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCustomer } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

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

      login(res.token, res.customer);
      navigate('/customer/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '40px auto',
        padding: '32px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>
        Customer Registration
      </h2>

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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <label
              style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555' }}
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Ahmed"
              value={formData.firstName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div>
            <label
              style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555' }}
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Ali"
              value={formData.lastName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555' }}
          >
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="student@university.edu"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555' }}
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+201000000000"
            value={formData.phone}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555' }}
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
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
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
        Already have an account?{' '}
        <Link
          to="/customer/login"
          style={{ color: '#3b889d', fontWeight: 'bold', textDecoration: 'none' }}
        >
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
