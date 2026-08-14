import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import RecentOrderItem from './RecentOrderItem';
import './RecentOrders.css';

const RecentOrders = ({ orders = [], loading = false, error = null, onRetry }) => {
  const displayOrders = orders.slice(0, 3);

  return (
    <section className="recent-orders-section" aria-label="Recent Orders">
      <div className="recent-orders__header">
        <h2 className="recent-orders__title">Recent Orders</h2>
        {!loading && !error && displayOrders.length > 0 && (
          <Link to={ROUTES.MY_ORDERS} className="recent-orders__see-all">
            See all →
          </Link>
        )}
      </div>

      {/* State 1: Loading Skeleton */}
      {loading && (
        <div className="recent-orders-skeleton">
          <div className="recent-order-skeleton-card" />
          <div className="recent-order-skeleton-card" />
        </div>
      )}

      {/* State 2: Error State */}
      {!loading && error && (
        <div className="recent-orders-error">
          <p className="recent-orders-error__text">⚠️ {error}</p>
          {onRetry && (
            <button type="button" className="recent-orders-error__retry" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* State 3: Empty State for New Customer */}
      {!loading && !error && displayOrders.length === 0 && (
        <div className="recent-orders-empty">
          <span className="recent-orders-empty__icon" aria-hidden="true">
            📦
          </span>
          <h3 className="recent-orders-empty__title">No orders yet</h3>
          <p className="recent-orders-empty__subtitle">
            Your first delivery is just a few taps away.
          </p>
          <Link to={ROUTES.NEW_ORDER} className="recent-orders-empty__cta">
            Create New Order
          </Link>
        </div>
      )}

      {/* State 4: Success with Real Orders */}
      {!loading && !error && displayOrders.length > 0 && (
        <div className="recent-orders__list">
          {displayOrders.map((order) => (
            <RecentOrderItem key={order.id || order._id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentOrders;
