import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/order.service';

const TrackOrders = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrderDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderById(id);
        if (isMounted) {
          setOrder(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load order details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>Track Order</h1>
        <button
          onClick={() => navigate('/my-orders')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          ← Back to Orders
        </button>
      </div>

      <p style={{ color: '#666', marginBottom: '24px' }}>Order ID: {id}</p>

      {loading && (
        <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
          Loading order tracking info...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '16px',
            color: '#ba1a1a',
            backgroundColor: '#ffdad6',
            borderRadius: '8px',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && order && (
        <div
          style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ margin: 0 }}>{order.title || 'Order Request'}</h2>
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '14px',
                background: '#E8EFFD',
                color: '#5B8DEF',
              }}
            >
              {order.status || 'AVAILABLE'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>Category</p>
              <p style={{ margin: 0, fontWeight: '600' }}>{order.category || 'General'}</p>
            </div>

            <div>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>Estimated Time</p>
              <p style={{ margin: 0, fontWeight: '600' }}>{order.estimatedTime || '15 mins'}</p>
            </div>

            <div>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>
                Pickup Location
              </p>
              <p style={{ margin: 0, fontWeight: '600' }}>{order.pickup || order.pickupLocation}</p>
            </div>

            <div>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>Destination</p>
              <p style={{ margin: 0, fontWeight: '600' }}>
                {order.destination || order.deliveryLocation}
              </p>
            </div>

            <div>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>Total Amount</p>
              <p style={{ margin: 0, fontWeight: '600' }}>
                {order.earnings || `${order.amount || 0} SAR`}
              </p>
            </div>

            <div>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>Order Placed</p>
              <p style={{ margin: 0, fontWeight: '600' }}>{formattedDate}</p>
            </div>
          </div>

          {order.notes && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>
                Special Instructions
              </p>
              <p style={{ margin: 0 }}>{order.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackOrders;
