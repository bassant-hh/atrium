import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaMotorcycle } from 'react-icons/fa';
import RoleCard from '../../components/RoleCard/RoleCard';
import { ROUTES } from '../../constants/routes';
import { goToRiderPortal } from '../../utils/navigation';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleCustomerClick = () => {
    navigate(ROUTES.CUSTOMER_LOGIN);
  };

  const handleRiderClick = () => {
    goToRiderPortal('/login');
  };

  return (
    <div className="role-selection-page">
      <h1 className="role-selection-page__title">Welcome to Makook</h1>
      <p className="role-selection-page__subtitle">Please select your portal to continue</p>

      <div className="role-selection-page__grid">
        <RoleCard
          icon={<FaUserGraduate />}
          title="Customer Portal"
          description="Order food, printing, stationery & books"
          onClick={handleCustomerClick}
        />

        <RoleCard
          icon={<FaMotorcycle />}
          title="Rider Portal"
          description="Deliver orders & manage driver duty"
          onClick={handleRiderClick}
        />
      </div>
    </div>
  );
};

export default RoleSelection;
