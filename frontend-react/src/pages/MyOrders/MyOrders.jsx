import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../../services/order.service';
import './MyOrders.css';

const statusDisplayMap = {
  AVAILABLE: { label: 'Waiting for Rider', color: '#C9A227', background: '#FEF9E3' },
  ACCEPTED: { label: 'Rider Assigned', color: '#5B8DEF', background: '#E8EFFD' },
  PICKED_UP: { label: 'In Transit', color: '#0C6780', background: '#BAEAFF' },
  DELIVERED: { label: 'Delivered', color: '#2E9E6B', background: '#E6F7F0' },
  CANCELLED: { label: 'Cancelled', color: '#E05252', background: '#FDECEC' },
};

const StatusBadge = ({ status }) => {
  const config = statusDisplayMap[status] || {
    label: status || 'Unknown',
    color: '#666',
    background: '#eee',
  };

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: config.background,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
};

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const orderId = order.id || order._id;

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : order.date || '';

  return (
    <div className="order-card">
      <div className="order-left">
        <h3>{order.title || 'Order Request'}</h3>

        <p className="order-meta">{order.category || 'General'}</p>

        <div className="order-meta">
          <p>
            <strong>Pickup:</strong> {order.pickup || order.pickupLocation}
          </p>
          <p>
            <strong>Delivery:</strong> {order.destination || order.deliveryLocation}
          </p>
        </div>
      </div>

      <div className="order-center">
        <StatusBadge status={order.status || 'AVAILABLE'} />
        <p className="order-meta">{formattedDate}</p>
      </div>

      <div className="order-right">
        <h3 className="order-amount">{order.amount != null ? `${order.amount} SAR` : 'N/A'}</h3>

        <button className="track-btn" onClick={() => navigate(`/track-orders/${orderId}`)}>
          Track
        </button>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyOrders();
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load orders');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const matchesFilter = (orderStatus, currentFilter) => {
    if (currentFilter === 'All') return true;
    if (currentFilter === 'Available') return orderStatus === 'AVAILABLE';
    if (currentFilter === 'In Progress')
      return orderStatus === 'ACCEPTED' || orderStatus === 'PICKED_UP';
    if (currentFilter === 'Delivered') return orderStatus === 'DELIVERED';
    return true;
  };

  const filteredOrders = orders.filter((order) => matchesFilter(order.status, filter));

  return (
    <div className="my-orders-page">
      <div className="orders-header">
        <div>
          <h1>My Orders</h1>
          <p>Track all your orders</p>
        </div>

        <button className="new-order-btn" onClick={() => navigate('/new-order')}>
          + New Order
        </button>
      </div>

      <div className="orders-filters">
        {['All', 'Available', 'In Progress', 'Delivered'].map((item) => (
          <button
            key={item}
            className={filter === item ? 'active' : ''}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading your orders...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '16px',
            color: '#ba1a1a',
            backgroundColor: '#ffdad6',
            borderRadius: '8px',
            margin: '16px 0',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No orders found.</div>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id || order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
