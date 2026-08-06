import React from 'react';
import './RoleCard.css';

const RoleCard = ({ icon, title, description, onClick }) => {
  return (
    <button type="button" className="role-card" onClick={onClick}>
      <div className="role-card__icon-container">{icon}</div>
      <h3 className="role-card__title">{title}</h3>
      <p className="role-card__description">{description}</p>
    </button>
  );
};

export default RoleCard;
