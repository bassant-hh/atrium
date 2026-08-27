import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaCalendarAlt,
  FaSignOutAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaShoppingBag,
  FaPlusCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCopy,
} from 'react-icons/fa';
import { getCustomerProfile, updateCustomerProfile } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import './profile.css';

const PHONE_REGEX = /^01[0125][0-9]{8}$/;

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState(authUser);
  const [loading, setLoading] = useState(!authUser);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerProfile();
        if (isMounted && data) {
          setProfile(data);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load customer profile details.');
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

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartEdit = () => {
    if (!profile) return;
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
    });
    setFieldErrors({});
    setError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
    });
    setFieldErrors({});
    setError(null);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedFirst = formData.firstName.trim();
    const trimmedLast = formData.lastName.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedFirst) {
      errors.firstName = 'First name is required.';
    }

    if (!trimmedLast) {
      errors.lastName = 'Last name is required.';
    }

    if (!trimmedPhone) {
      errors.phone = 'Phone number is required.';
    } else if (!PHONE_REGEX.test(trimmedPhone)) {
      errors.phone =
        'Must be a valid 11-digit Egyptian mobile number starting with 010, 011, 012, or 015.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSuccessMessage(null);
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const updated = await updateCustomerProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      });

      setProfile(updated);
      if (refreshUser) {
        await refreshUser();
      }

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyId = () => {
    if (!profile?.id) return;
    navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getInitials = () => {
    if (!profile) return 'C';
    const first = profile.firstName ? profile.firstName[0] : '';
    const last = profile.lastName ? profile.lastName[0] : '';
    return `${first}${last}`.toUpperCase() || 'C';
  };

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active Member';

  if (loading) {
    return (
      <div className="profile-loading-container" aria-live="polite">
        <div className="profile-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {/* Top Header */}
      <div className="profile-header">
        <div>
          <h1 className="profile-header__title">Customer Profile</h1>
          <p className="profile-header__subtitle">
            Manage your account overview and delivery settings
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="profile-success-alert" role="status" aria-live="polite">
          <FaCheckCircle size={18} />
          <span>{successMessage}</span>
          <button
            type="button"
            className="profile-alert-dismiss"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss alert"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {error && (
        <div className="profile-error-alert" role="alert" aria-live="assertive">
          <FaInfoCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            className="profile-alert-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss alert"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {profile && (
        <div className="profile-grid-layout">
          {/* Left Hero Card */}
          <aside className="profile-hero-card">
            <div className="profile-avatar-container">
              <div className="profile-avatar-circle">{getInitials()}</div>
              <span className="profile-verified-badge" title="Verified Customer">
                <FaCheckCircle />
              </span>
            </div>

            <h2 className="profile-hero__name">
              {profile.firstName} {profile.lastName}
            </h2>
            <span className="profile-hero__role-pill">Makook Customer</span>

            <div className="profile-hero__meta">
              <div className="profile-hero__meta-item">
                <FaEnvelope className="profile-hero__icon" />
                <span className="profile-hero__text">{profile.email}</span>
              </div>

              <div className="profile-hero__meta-item">
                <FaPhone className="profile-hero__icon" />
                <span className="profile-hero__text">{profile.phone}</span>
              </div>
            </div>

            <div className="profile-hero__quick-actions">
              <button
                type="button"
                className="profile-hero__btn profile-hero__btn--primary"
                onClick={() => navigate('/new-order')}
              >
                <FaPlusCircle />
                <span>New Order</span>
              </button>

              <button
                type="button"
                className="profile-hero__btn profile-hero__btn--secondary"
                onClick={() => navigate('/my-orders')}
              >
                <FaShoppingBag />
                <span>My Orders</span>
              </button>

              <button
                type="button"
                className="profile-hero__btn profile-hero__btn--logout"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Right Content Column */}
          <main className="profile-main-content">
            {/* Section 1: Account Information */}
            <div className="profile-section-card">
              <div className="profile-section-card__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaUser className="profile-section-card__title-icon" />
                  <h3 className="profile-section-card__title">Personal Information</h3>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    className="profile-edit-trigger-btn"
                    onClick={handleStartEdit}
                  >
                    <FaEdit />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <span className="profile-editing-tag">Editing Mode</span>
                )}
              </div>

              {!isEditing ? (
                /* READ-ONLY MODE */
                <div className="profile-fields-grid">
                  <div className="profile-field-box">
                    <label className="profile-field-box__label">First Name</label>
                    <p className="profile-field-box__value">{profile.firstName}</p>
                  </div>

                  <div className="profile-field-box">
                    <label className="profile-field-box__label">Last Name</label>
                    <p className="profile-field-box__value">{profile.lastName}</p>
                  </div>

                  <div className="profile-field-box">
                    <label className="profile-field-box__label">Email Address (Read-only)</label>
                    <p className="profile-field-box__value">{profile.email}</p>
                  </div>

                  <div className="profile-field-box">
                    <label className="profile-field-box__label">Phone Number</label>
                    <p className="profile-field-box__value">{profile.phone}</p>
                  </div>
                </div>
              ) : (
                /* EDITING MODE FORM */
                <form onSubmit={handleSaveProfile} className="profile-edit-form" noValidate>
                  <div className="profile-fields-grid">
                    {/* First Name Input */}
                    <div className="profile-form-group">
                      <label htmlFor="profile-firstName" className="profile-form-label">
                        First Name <span className="required-star">*</span>
                      </label>
                      <input
                        id="profile-firstName"
                        type="text"
                        className={`profile-form-input ${
                          fieldErrors.firstName ? 'profile-form-input--error' : ''
                        }`}
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={saving}
                        placeholder="First Name"
                        aria-invalid={!!fieldErrors.firstName}
                      />
                      {fieldErrors.firstName && (
                        <span className="profile-form-error">{fieldErrors.firstName}</span>
                      )}
                    </div>

                    {/* Last Name Input */}
                    <div className="profile-form-group">
                      <label htmlFor="profile-lastName" className="profile-form-label">
                        Last Name <span className="required-star">*</span>
                      </label>
                      <input
                        id="profile-lastName"
                        type="text"
                        className={`profile-form-input ${
                          fieldErrors.lastName ? 'profile-form-input--error' : ''
                        }`}
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={saving}
                        placeholder="Last Name"
                        aria-invalid={!!fieldErrors.lastName}
                      />
                      {fieldErrors.lastName && (
                        <span className="profile-form-error">{fieldErrors.lastName}</span>
                      )}
                    </div>

                    {/* Email Read-Only Input */}
                    <div className="profile-form-group">
                      <label htmlFor="profile-email" className="profile-form-label">
                        Email Address (Read-only)
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        className="profile-form-input profile-form-input--disabled"
                        value={profile.email}
                        disabled
                        readOnly
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="profile-form-group">
                      <label htmlFor="profile-phone" className="profile-form-label">
                        Phone Number <span className="required-star">*</span>
                      </label>
                      <input
                        id="profile-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className={`profile-form-input ${
                          fieldErrors.phone ? 'profile-form-input--error' : ''
                        }`}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={saving}
                        placeholder="01012345678"
                        aria-invalid={!!fieldErrors.phone}
                      />
                      {fieldErrors.phone && (
                        <span className="profile-form-error">{fieldErrors.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Edit Actions */}
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-form-btn profile-form-btn--cancel"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>

                    <button
                      type="submit"
                      className="profile-form-btn profile-form-btn--save"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="fa-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaSave />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Section 2: Account & Security Overview */}
            <div className="profile-section-card">
              <div className="profile-section-card__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaShieldAlt className="profile-section-card__title-icon" />
                  <h3 className="profile-section-card__title">Account & Security Overview</h3>
                </div>
              </div>

              <div className="profile-fields-grid">
                <div className="profile-field-box">
                  <label className="profile-field-box__label">Customer ID</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p
                      className="profile-field-box__value"
                      style={{ fontFamily: 'monospace', fontSize: '13px' }}
                    >
                      #{profile.id ? profile.id.slice(-8) : 'N/A'}
                    </p>
                    <button
                      type="button"
                      className="profile-copy-btn"
                      onClick={handleCopyId}
                      title="Copy Full Customer ID"
                    >
                      <FaCopy size={12} />
                      {copiedId && <span className="profile-copy-tooltip">Copied!</span>}
                    </button>
                  </div>
                </div>

                <div className="profile-field-box">
                  <label className="profile-field-box__label">Default Currency</label>
                  <p className="profile-field-box__value">EGP (Egyptian Pound)</p>
                </div>

                <div className="profile-field-box">
                  <label className="profile-field-box__label">Member Since</label>
                  <p
                    className="profile-field-box__value"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaCalendarAlt size={13} style={{ color: '#156B82' }} />
                    <span>{formattedDate}</span>
                  </p>
                </div>

                <div className="profile-field-box">
                  <label className="profile-field-box__label">Account Status</label>
                  <span className="profile-status-badge">Active Customer</span>
                </div>
              </div>
            </div>

            {/* Section 3: Profile Security Note */}
            <div className="profile-notice-box">
              <FaInfoCircle className="profile-notice-box__icon" />
              <div>
                <h4 className="profile-notice-box__title">Account Security Note</h4>
                <p className="profile-notice-box__desc">
                  First name, Last name, and Phone number can be updated directly above. Your email
                  address is your primary account identifier and remains read-only for security.
                </p>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Profile;
