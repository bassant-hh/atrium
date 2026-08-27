import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaMapMarkerAlt,
  FaStore,
  FaClock,
  FaReceipt,
  FaRoute,
  FaRedo,
  FaExclamationTriangle,
  FaBoxOpen,
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
} from 'react-icons/fa';
import { getMyOrders, cancelOrder } from '../../services/order.service';
import './MyOrders.css';

const statusDisplayMap = {
  AVAILABLE: {
    label: 'Waiting for Rider',
    color: '#C9A227',
    background: '#FEF9E3',
    isActive: true,
  },
  ACCEPTED: { label: 'Rider Assigned', color: '#156B82', background: '#E8EFFD', isActive: true },
  PICKED_UP: { label: 'In Transit', color: '#0C6780', background: '#BAEAFF', isActive: true },
  DELIVERED: { label: 'Delivered', color: '#2E9E6B', background: '#E6F7F0', isActive: false },
  CANCELLED: { label: 'Cancelled', color: '#E05252', background: '#FDECEC', isActive: false },
};

const paymentStatusMap = {
  PAID: { label: 'Paid', color: '#2E9E6B', background: '#E6F7F0' },
  PENDING: { label: 'Pending', color: '#C9A227', background: '#FEF9E3' },
  FAILED: { label: 'Failed', color: '#E05252', background: '#FDECEC' },
  REFUNDED: { label: 'Refunded', color: '#607D8B', background: '#ECEFF1' },
};

const PaymentIcon = ({ method }) => {
  if (method === 'CARD') return <FaCreditCard style={{ color: '#156B82' }} />;
  if (method === 'WALLET') return <FaWallet style={{ color: '#156B82' }} />;
  return <FaMoneyBillWave style={{ color: '#2E9E6B' }} />;
};

const StatusBadge = ({ status }) => {
  const config = statusDisplayMap[status] || {
    label: status || 'Unknown',
    color: '#666',
    background: '#eee',
  };

  return (
    <span
      className="status-badge-chip"
      style={{
        backgroundColor: config.background,
        color: config.color,
      }}
    >
      {config.isActive && <span className="status-badge-pulse" />}
      {config.label}
    </span>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const config = paymentStatusMap[status] || paymentStatusMap.PENDING;

  return (
    <span
      className="payment-badge-chip"
      style={{
        backgroundColor: config.background,
        color: config.color,
      }}
    >
      Payment: {config.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="order-card-skeleton animate-pulse">
    <div className="skeleton-line skeleton-header" />
    <div className="skeleton-line skeleton-body" />
    <div className="skeleton-line skeleton-footer" />
  </div>
);

const OrderCard = ({ order, onCancelOrder }) => {
  const navigate = useNavigate();
  const orderId = order.id || order._id;
  const isAvailable = order.status === 'AVAILABLE';
  const isActive =
    order.status === 'AVAILABLE' || order.status === 'ACCEPTED' || order.status === 'PICKED_UP';

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : order.date || '';

  const paymentMethodText =
    order.paymentMethod === 'CARD'
      ? 'Credit / Debit Card'
      : order.paymentMethod === 'WALLET'
        ? 'Digital Wallet'
        : 'Cash on Delivery';

  const shortId =
    typeof orderId === 'string' && orderId.length >= 8 ? `#${orderId.slice(-8)}` : `#${orderId}`;

  return (
    <div className={`my-order-card ${isActive ? 'my-order-card--active' : ''}`}>
      {/* Top Header Strip */}
      <div className="my-order-card__header">
        <div className="my-order-card__title-group">
          <h3 className="my-order-card__title">{order.title || 'Campus Item Request'}</h3>
          <span className="my-order-card__category-badge">{order.category || 'General'}</span>
          <span className="my-order-card__ref-id">{shortId}</span>
        </div>

        <div className="my-order-card__status-group">
          <StatusBadge status={order.status || 'AVAILABLE'} />
        </div>
      </div>

      {/* Pickup to Destination Flow */}
      <div className="my-order-card__route">
        <div className="route-step">
          <span className="route-icon route-icon--pickup">
            <FaStore />
          </span>
          <div className="route-text">
            <span className="route-label">Pickup Point</span>
            <p className="route-address">
              {order.pickup || order.pickupLocation || 'Campus Pickup'}
            </p>
          </div>
        </div>

        <div className="route-arrow-connector">↓</div>

        <div className="route-step">
          <span className="route-icon route-icon--dropoff">
            <FaMapMarkerAlt />
          </span>
          <div className="route-text">
            <span className="route-label">Destination</span>
            <p className="route-address">
              {order.destination || order.deliveryLocation || 'Campus Destination'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="my-order-card__footer">
        <div className="my-order-card__meta">
          <div className="meta-row">
            <FaClock className="meta-icon" />
            <span>{formattedDate}</span>
          </div>

          <div className="meta-row">
            <PaymentIcon method={order.paymentMethod} />
            <span>{paymentMethodText}</span>
            <PaymentStatusBadge status={order.paymentStatus || 'PENDING'} />
          </div>
        </div>

        <div className="my-order-card__price-box">
          <span className="price-label">Total Amount</span>
          <span className="price-value">
            {order.amount != null ? `${order.amount} EGP` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="my-order-card__actions">
        {isAvailable && (
          <button
            className="btn-order-action btn-order-action--cancel"
            onClick={() => onCancelOrder(orderId)}
            aria-label="Cancel this order request"
          >
            Cancel Order
          </button>
        )}

        <button
          className="btn-order-action btn-order-action--secondary"
          onClick={() => navigate(`/order-confirmation/${orderId}`)}
          aria-label="View invoice for this order"
        >
          <FaReceipt /> View Invoice
        </button>

        <button
          className="btn-order-action btn-order-action--primary"
          onClick={() => navigate(`/track-orders/${orderId}`)}
          aria-label="Track status of this order"
        >
          <FaRoute /> Track Order
        </button>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order before a rider accepts it?',
    );
    if (!confirmed) return;

    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => ((o.id || o._id) === orderId ? { ...o, status: updated.status } : o)),
      );
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  // Compute counts dynamically
  const counts = useMemo(() => {
    const active = orders.filter(
      (o) => o.status === 'AVAILABLE' || o.status === 'ACCEPTED' || o.status === 'PICKED_UP',
    ).length;
    const completed = orders.filter((o) => o.status === 'DELIVERED').length;
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;
    return { all: orders.length, active, completed, cancelled };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'Active') {
      return orders.filter(
        (o) => o.status === 'AVAILABLE' || o.status === 'ACCEPTED' || o.status === 'PICKED_UP',
      );
    }
    if (activeTab === 'Completed') {
      return orders.filter((o) => o.status === 'DELIVERED');
    }
    if (activeTab === 'Cancelled') {
      return orders.filter((o) => o.status === 'CANCELLED');
    }
    return orders;
  }, [orders, activeTab]);

  const tabs = [
    { key: 'All', label: 'All Orders', count: counts.all },
    { key: 'Active', label: 'Active', count: counts.active },
    { key: 'Completed', label: 'Completed', count: counts.completed },
    { key: 'Cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <div className="my-orders-page-container">
      {/* Page Header */}
      <div className="my-orders-header">
        <div>
          <h1 className="my-orders-header__title">My Orders</h1>
          <p className="my-orders-header__subtitle">
            Track active deliveries and view your order history
          </p>
        </div>

        <button className="new-order-primary-btn" onClick={() => navigate('/new-order')}>
          <FaPlus /> New Order
        </button>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="my-orders-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === t.key}
            className={`my-orders-tab-btn ${activeTab === t.key ? 'my-orders-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            <span className="tab-count-pill">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Loading Skeleton View */}
      {loading && (
        <div className="orders-list-container">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error & Retry View */}
      {!loading && error && (
        <div className="my-orders-error-card">
          <FaExclamationTriangle size={32} className="error-card-icon" />
          <h3>Could Not Load Orders</h3>
          <p>{error}</p>
          <button className="retry-fetch-btn" onClick={fetchOrders}>
            <FaRedo /> Try Again
          </button>
        </div>
      )}

      {/* Empty State View */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="my-orders-empty-card">
          <FaBoxOpen size={48} className="empty-card-icon" />
          <h2>
            {activeTab === 'All'
              ? 'No orders placed yet'
              : `No ${activeTab.toLowerCase()} orders found`}
          </h2>
          <p>
            {activeTab === 'All'
              ? 'Your delivery requests will appear here once you place your first order.'
              : `You do not have any ${activeTab.toLowerCase()} orders at the moment.`}
          </p>
          <button className="new-order-primary-btn" onClick={() => navigate('/new-order')}>
            <FaPlus /> Place a New Order
          </button>
        </div>
      )}

      {/* Real Orders List Stream */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="orders-list-container">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id || order._id}
              order={order}
              onCancelOrder={handleCancelOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
