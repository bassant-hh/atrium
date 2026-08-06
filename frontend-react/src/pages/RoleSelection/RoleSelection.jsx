import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserGraduate, FaMotorcycle, FaSignInAlt, FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import RoleCard from '../../components/RoleCard/RoleCard';
import { ROUTES } from '../../constants/routes';
import { goToRiderPortal } from '../../utils/navigation';
import { saveRole } from '../../utils/role';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intent = location.state?.intent ?? null;
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleClick = (roleKey) => {
    saveRole(roleKey);

    if (intent === 'register') {
      if (roleKey === 'customer') {
        navigate(ROUTES.CUSTOMER_REGISTER);
      } else {
        goToRiderPortal('/register');
      }
    } else if (intent === 'login') {
      if (roleKey === 'customer') {
        navigate(ROUTES.CUSTOMER_LOGIN);
      } else {
        goToRiderPortal('/login');
      }
    } else {
      setSelectedRole(roleKey);
    }
  };

  const handleActionSelect = (action) => {
    if (selectedRole === 'customer') {
      if (action === 'register') {
        navigate(ROUTES.CUSTOMER_REGISTER);
      } else {
        navigate(ROUTES.CUSTOMER_LOGIN);
      }
    } else if (selectedRole === 'rider') {
      if (action === 'register') {
        goToRiderPortal('/register');
      } else {
        goToRiderPortal('/login');
      }
    }
  };

  return (
    <div className="role-selection-page">
      {!selectedRole ? (
        <>
          <h1 className="role-selection-page__title">Welcome to Makook</h1>
          <p className="role-selection-page__subtitle">
            {intent === 'register'
              ? 'Please select your portal to create an account'
              : intent === 'login'
                ? 'Please select your portal to sign in'
                : 'Please select your identity to continue'}
          </p>

          <div className="role-selection-page__grid">
            <RoleCard
              icon={<FaUserGraduate />}
              title="Customer Portal"
              description="Order food, printing, stationery & books"
              onClick={() => handleRoleClick('customer')}
            />

            <RoleCard
              icon={<FaMotorcycle />}
              title="Rider Portal"
              description="Deliver orders & manage driver duty"
              onClick={() => handleRoleClick('rider')}
            />
          </div>
        </>
      ) : (
        <>
          <h1 className="role-selection-page__title">
            {selectedRole === 'customer' ? 'Customer Portal' : 'Rider Portal'}
          </h1>
          <p className="role-selection-page__subtitle">Select an action to proceed</p>

          <div className="role-selection-page__grid">
            <RoleCard
              icon={<FaSignInAlt />}
              title="Sign In"
              description={`Log in to your ${selectedRole} account`}
              onClick={() => handleActionSelect('login')}
            />

            <RoleCard
              icon={<FaUserPlus />}
              title="Register"
              description={`Create a new ${selectedRole} account`}
              onClick={() => handleActionSelect('register')}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid #004d62',
                color: '#004d62',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onClick={() => setSelectedRole(null)}
            >
              <FaArrowLeft /> Choose Different Identity
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSelection;
