import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import './ActiveOrder.css';

const statusConfigMap = {
  AVAILABLE: {
    badgeLabel: 'Waiting for Rider',
    message: 'Waiting for a rider to accept your order...',
    classSuffix: 'available',
  },
  ACCEPTED: {
    badgeLabel: 'Rider Assigned',
    message: 'Rider assigned & heading to pickup location',
    classSuffix: 'accepted',
  },
  PICKED_UP: {
    badgeLabel: 'In Transit',
    message: 'Order picked up! Your rider is on the way',
    classSuffix: 'picked_up',
  },
};

const ActiveOrder = ({ order }) => {
  if (!order) return null;

  const status = order.status;
  if (status !== 'AVAILABLE' && status !== 'ACCEPTED' && status !== 'PICKED_UP') {
    return null;
  }

  const config = statusConfigMap[status] || statusConfigMap.AVAILABLE;
  const orderId = order.id || order._id;
  const shortId = orderId ? `#${String(orderId).slice(-6).toUpperCase()}` : '';

  const pickupStr = order.pickup || 'Pickup';
  const destStr = order.destination || 'Destination';

  return (
    <section className="active-order-container" aria-label="Active Order Status">
      <div className="active-order-card">
        <div className="active-order-card__header">
          <div className="active-order-card__badge-wrapper">
            <span className={`active-order-badge active-order-badge--${config.classSuffix}`}>
              <span className="active-order-badge__dot" aria-hidden="true" />
              {config.badgeLabel}
            </span>
          </div>
          {shortId && <span className="active-order-card__id">{shortId}</span>}
        </div>

        <div className="active-order-card__body">
          <h3 className="active-order-card__msg">{config.message}</h3>
          <p className="active-order-card__route">
            <FaMapMarkerAlt style={{ color: '#156b82', flexShrink: 0 }} aria-hidden="true" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pickupStr} → {destStr}
            </span>
          </p>
        </div>

        <div className="active-order-card__footer">
          <Link to={`/track-orders/${orderId}`} className="active-order-card__track-btn">
            <span>Track Order</span>
            <FaArrowRight style={{ fontSize: '0.8rem' }} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ActiveOrder;
