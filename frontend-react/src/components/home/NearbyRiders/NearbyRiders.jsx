import React from 'react';
import { FaMotorcycle } from 'react-icons/fa';
import './NearbyRiders.css';

const NearbyRiders = () => {
  return (
    <section className="nearby-riders-section" aria-label="Nearby Riders">
      <div className="nearby-riders-card">
        <div className="nearby-riders-card__icon" aria-hidden="true">
          <FaMotorcycle />
        </div>
        <div className="nearby-riders-card__content">
          <span className="nearby-riders-card__headline">Nearby Riders</span>
          <p className="nearby-riders-card__desc">
            Campus rider availability map will appear here soon.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NearbyRiders;
