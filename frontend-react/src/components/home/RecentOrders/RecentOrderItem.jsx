import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const statusConfigMap = {
  AVAILABLE: { label: 'Waiting for Rider', classSuffix: 'available' },
  ACCEPTED: { label: 'Rider Assigned', classSuffix: 'accepted' },
  PICKED_UP: { label: 'In Transit', classSuffix: 'picked_up' },
  DELIVERED: { label: 'Delivered', classSuffix: 'delivered' },
  CANCELLED: { label: 'Cancelled', classSuffix: 'cancelled' },
};

const formatDateConcise = (dateValue) => {
  if (!dateValue) return '';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const RecentOrderItem = ({ order }) => {
  const orderId = order.id || order._id;
  const status = order.status || 'AVAILABLE';
  const config = statusConfigMap[status] || {
    label: status,
    classSuffix: 'available',
  };

  const formattedDate = formatDateConcise(order.createdAt);
  const displayTitle = order.title || order.category || 'General Order';

  return (
    <div className="recent-order-card">
      <div className="recent-order-card__info">
        <h4 className="recent-order-card__title">{displayTitle}</h4>
        <div className="recent-order-card__meta">
          <span className={`recent-order-badge recent-order-badge--${config.classSuffix}`}>
            {config.label}
          </span>
          {formattedDate && <span>• {formattedDate}</span>}
        </div>
      </div>

      <div className="recent-order-card__actions">
        <span className="recent-order-card__amount">
          {order.amount != null ? `${order.amount} SAR` : 'N/A'}
        </span>
        <Link to={`/track-orders/${orderId}`} className="recent-order-card__track-link">
          <span>Track</span>
          <FaChevronRight style={{ fontSize: '0.65rem' }} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default RecentOrderItem;
