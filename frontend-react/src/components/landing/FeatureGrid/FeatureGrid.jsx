import React from 'react';
import {
  FaBolt,
  FaUniversity,
  FaMobileAlt,
  FaClock,
  FaShieldAlt,
  FaUserShield,
} from 'react-icons/fa';
import './FeatureGrid.css';

const FEATURES = [
  {
    id: 1,
    icon: FaBolt,
    title: 'Fast Campus Delivery',
    description:
      'Dedicated riders stationed within campus boundaries ensure delivery times under 20 minutes.',
  },
  {
    id: 2,
    icon: FaUniversity,
    title: 'Hyper-Local Campus Focus',
    description:
      'Pinpoint precision delivery directly to building numbers, lecture halls, and dorm rooms.',
  },
  {
    id: 3,
    icon: FaMobileAlt,
    title: 'Seamless Order Placement',
    description: 'Clean, frictionless ordering experience customized for busy student schedules.',
  },
  {
    id: 4,
    icon: FaClock,
    title: 'Real-Time Status Tracking',
    description:
      'Stay informed every step of the way from request creation to delivery confirmation.',
  },
  {
    id: 5,
    icon: FaShieldAlt,
    title: 'Secure Authentication',
    description: 'JWT-backed secure access ensuring student data privacy and safety.',
  },
  {
    id: 6,
    icon: FaUserShield,
    title: 'Vetted Campus Riders',
    description:
      'All deliveries are fulfilled by verified university students and authorized campus couriers.',
  },
];

const FeatureGrid = () => {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <span className="features-header__tag">Platform Advantages</span>
          <h2 className="features-header__title">Why Choose Makook?</h2>
        </div>

        <div className="features-grid">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="feature-card">
                <div className="feature-card__icon">
                  <Icon />
                </div>
                <h3 className="feature-card__title">{feat.title}</h3>
                <p className="feature-card__desc">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
