import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerProfile } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import './profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(authUser);
  const [loading, setLoading] = useState(!authUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load customer profile');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading customer profile...
      </div>
    );
  }

  return (
    <div
      className="profile-page"
      style={{ maxWidth: '600px', margin: '40px auto', padding: '24px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 className="page-title" style={{ margin: 0 }}>
          Customer Profile
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#ba1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div
          style={{
            color: '#ba1a1a',
            backgroundColor: '#ffdad6',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {profile && (
        <div
          style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '4px' }}
            >
              First Name
            </label>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
              {profile.firstName}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '4px' }}
            >
              Last Name
            </label>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
              {profile.lastName}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '4px' }}
            >
              Email Address
            </label>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
              {profile.email}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '4px' }}
            >
              Phone Number
            </label>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
              {profile.phone}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
