import React from "react";

const ProfilCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="profile-card">
      <div className="avatar-wrapper">
        <div className="avatar">
          {data.fullname ? data.fullname.slice(0, 2).toUpperCase() : "AA"}
        </div>

        <button className="avatar-btn">
          <i className="fa-regular fa-camera"></i>
        </button>
      </div>

      <h3 className="profile-name">{data.fullname}</h3>

      <p className="profile-role">
        {data.role === "CLIENT" ? "Client" : "Student"}
      </p>

      <div className="profile-stats">
        <div>
          <span>Member Since</span>
          <strong>Jan 2026</strong>
        </div>

        <div>
          <span>Total Orders</span>
          <strong>{data.totalorders || 0}</strong>
        </div>

        <div>
          <span>Rating</span>
          <strong className="ratings">
            <i className="fa-solid fa-star"></i>
            <span className="rates">{data.rating || 0}</span>
          </strong>
        </div>
      </div>
    </div>
  );
};

export default ProfilCard;