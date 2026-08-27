import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import { getOrderById } from '../../services/order.service';
import './orderConfirmation.css';

const statusDisplayMap = {
  AVAILABLE: { label: 'Waiting for Rider', color: '#C9A227', background: '#FEF9E3' },
  ACCEPTED: { label: 'Rider Assigned', color: '#5B8DEF', background: '#E8EFFD' },
  PICKED_UP: { label: 'In Transit', color: '#0C6780', background: '#BAEAFF' },
  DELIVERED: { label: 'Delivered', color: '#2E9E6B', background: '#E6F7F0' },
  CANCELLED: { label: 'Cancelled', color: '#E05252', background: '#FDECEC' },
};

const paymentStatusMap = {
  PAID: { label: 'Paid', color: '#2E9E6B', background: '#E6F7F0' },
  PENDING: { label: 'Pending', color: '#C9A227', background: '#FEF9E3' },
  FAILED: { label: 'Failed', color: '#E05252', background: '#FDECEC' },
  REFUNDED: { label: 'Refunded', color: '#607D8B', background: '#ECEFF1' },
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError('No order ID provided.');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getOrderById(orderId);
        if (isMounted) {
          setOrder(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load order confirmation details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-conf-loading">
        <FaSpinner size={36} className="fa-spin" style={{ color: '#156B82' }} />
        <h2>Loading your order invoice...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-conf-container">
        <div className="order-conf-icon order-conf-icon--error">
          <FaExclamationCircle size={40} />
        </div>
        <h1>Order Invoice Unavailable</h1>
        <p className="order-conf-subtitle">{error || 'Could not locate the specified order.'}</p>
        <div className="order-conf-actions">
          <button
            className="order-conf-btn order-conf-btn--primary"
            onClick={() => navigate('/my-orders')}
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const unitPrice = order.price ?? 0;
  const qty = order.quantity ?? 1;
  const itemSubtotal = order.itemSubtotal ?? unitPrice * qty;
  const deliveryFee = order.deliveryFee ?? 5;
  const totalAmount = order.amount ?? itemSubtotal + deliveryFee;

  const paymentMethodLabel =
    order.paymentMethod === 'CARD'
      ? 'Credit / Debit Card'
      : order.paymentMethod === 'WALLET'
        ? 'Digital Wallet'
        : 'Cash on Delivery';

  const currentStatusKey = order.status || 'AVAILABLE';
  const statusConfig = statusDisplayMap[currentStatusKey] || statusDisplayMap.AVAILABLE;

  const currentPaymentKey = order.paymentStatus || 'PENDING';
  const paymentConfig = paymentStatusMap[currentPaymentKey] || paymentStatusMap.PENDING;

  return (
    <div className="order-conf-container">
      <div className="order-conf-icon order-conf-icon--success">
        <FaCheckCircle size={40} />
      </div>

      <h1 className="order-conf-title">✓ Order Confirmed</h1>
      <p className="order-conf-subtitle">Your order details and financial summary</p>

      {/* Financial & Order Summary Card */}
      <div className="order-conf-card">
        <h3 className="order-conf-card__heading">Order Summary</h3>

        <div className="order-conf-row">
          <span>Order Reference</span>
          <strong style={{ fontFamily: 'monospace' }}>#{orderId.slice(-8)}</strong>
        </div>

        <div className="order-conf-row">
          <span>Item</span>
          <strong>{order.title || 'Campus Item'}</strong>
        </div>

        <div className="order-conf-row">
          <span>Item Price</span>
          <span>{unitPrice} EGP</span>
        </div>

        <div className="order-conf-row">
          <span>Quantity</span>
          <span>{qty}</span>
        </div>

        <div className="order-conf-row order-conf-row--divider">
          <span>Items Total</span>
          <span>{itemSubtotal} EGP</span>
        </div>

        <div className="order-conf-row">
          <span>Delivery Fee</span>
          <span>{deliveryFee} EGP</span>
        </div>

        <div className="order-conf-row order-conf-row--total">
          <span>Total Amount</span>
          <span className="order-conf-total-val">{totalAmount} EGP</span>
        </div>
      </div>

      {/* Payment Information Card */}
      <div className="order-conf-card">
        <h3 className="order-conf-card__heading">Payment Information</h3>

        <div className="order-conf-row">
          <span>Payment Type</span>
          <strong style={{ color: '#156B82' }}>{paymentMethodLabel}</strong>
        </div>

        <div className="order-conf-row">
          <span>Payment Status</span>
          <span
            className="order-conf-badge"
            style={{ backgroundColor: paymentConfig.background, color: paymentConfig.color }}
          >
            {paymentConfig.label}
          </span>
        </div>

        <div className="order-conf-row order-conf-row--highlight">
          <span>
            {order.paymentMethod === 'CASH' ? 'Amount to Pay on Delivery' : 'Total Amount Paid'}
          </span>
          <strong style={{ fontSize: '16px', color: '#156B82' }}>{totalAmount} EGP</strong>
        </div>
      </div>

      {/* Order Status Card */}
      <div className="order-conf-card">
        <h3 className="order-conf-card__heading">Order Status</h3>

        <div className="order-conf-row">
          <span>Current Status</span>
          <span
            className="order-conf-badge"
            style={{ backgroundColor: statusConfig.background, color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Navigation CTA Buttons */}
      <div className="order-conf-actions">
        <button
          className="order-conf-btn order-conf-btn--primary"
          onClick={() => navigate(`/track-orders/${orderId}`)}
        >
          Track My Order
        </button>
        <button
          className="order-conf-btn order-conf-btn--secondary"
          onClick={() => navigate('/my-orders')}
        >
          View My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
