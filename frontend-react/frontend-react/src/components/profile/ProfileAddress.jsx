import React, { useState } from 'react'

const ProfileAddress = () => {
    const [addresses, setAddresses] = useState([
        { label: "Dorm Room", address: "Building C, Room 205" },
        { label: "Library", address: "Main Library" },
      ]);
    
      const removeAddress = (index) => {
        setAddresses((prev) => prev.filter((_, i) => i !== index));
      };
  return <>
    <section className="card-box">
            <div className="card-header">
              <span>Saved Addresses</span>
              <button className="add-btn mb-3">+ Add</button>
            </div>

            <div className="address-list">
              {addresses.map((addr, i) => (
                <div key={i} className="address-card">
                  <div className="address-info">
                    <div className="address-icon">
                      <i class="fa-solid fa-location-dot"></i>
                    </div>

                    <div>
                      <p className="address-title">{addr.label}</p>
                      <span className="address-sub">{addr.address}</span>
                    </div>
                  </div>

                  <div className="address-actions">
                    <button
                      className="delete-btn"
                      onClick={() => removeAddress(i)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
  </>
}

export default ProfileAddress