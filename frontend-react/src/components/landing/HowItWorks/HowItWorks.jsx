import React from 'react';
import { FaMousePointer, FaClipboardList, FaMapMarkerAlt, FaSmile } from 'react-icons/fa';
import './HowItWorks.css';

const STEPS = [
  {
    step: 1,
    icon: FaMousePointer,
    title: 'Choose Service',
    description:
      'Select whether you need food, document printing, books, stationery, or parcel relay.',
  },
  {
    step: 2,
    icon: FaClipboardList,
    title: 'Place Order',
    description: 'Enter your specific campus pickup and delivery location (building name & room).',
  },
  {
    step: 3,
    icon: FaMapMarkerAlt,
    title: 'Track Delivery',
    description: 'Follow your dedicated campus rider as they navigate directly to your spot.',
  },
  {
    step: 4,
    icon: FaSmile,
    title: 'Receive Order',
    description:
      'Receive your order right at your dorm or classroom door without breaking study focus.',
  },
];

const HowItWorks = () => {
  return (
    <section className="how-section">
      <div className="how-container">
        <div className="how-header">
          <span className="how-header__tag">Effortless Workflow</span>
          <h2 className="how-header__title">How Makook Works</h2>
        </div>

        <div className="how-timeline">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="how-step-card">
                <span className="how-step-number">0{item.step}</span>
                <div className="how-step-icon">
                  <Icon />
                </div>
                <h3 className="how-step-title">{item.title}</h3>
                <p className="how-step-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
