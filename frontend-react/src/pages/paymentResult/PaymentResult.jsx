import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { getOrderById, verifyPayment } from '../../services/order.service';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId');
  const initialStatus = searchParams.get('status');
  const txnId = searchParams.get('txnId');

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(initialStatus || 'PENDING');
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const verifyAndFetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setErrorMsg('No order ID reference found in payment callback URL.');
        return;
      }

      try {
        setLoading(true);

        // 1. Trigger backend verification check
        const verifyRes = await verifyPayment(orderId, txnId);
        if (isMounted && verifyRes && verifyRes.paymentStatus) {
          setPaymentStatus(verifyRes.paymentStatus);
        }

        // 2. Fetch authoritative order details
        const orderData = await getOrderById(orderId);
        if (isMounted) {
          setOrderDetails(orderData);
          if (orderData.paymentStatus) {
            setPaymentStatus(orderData.paymentStatus);
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.message || 'Failed to verify payment status.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyAndFetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, txnId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <FaSpinner size={36} className="fa-spin" style={{ color: '#156B82' }} />
        <h2 style={{ fontSize: '18px', color: '#263238', fontWeight: '700' }}>
          Verifying Payment with Gateway...
        </h2>
        <p style={{ fontSize: '14px', color: '#607D8B' }}>
          Please wait while we confirm your transaction
        </p>
      </div>
    );
  }

  const isPaid = paymentStatus === 'PAID';

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '40px auto',
        padding: '32px 24px',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        textAlign: 'center',
      }}
    >
      {isPaid ? (
        <>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#E6F7F0',
              color: '#2E9E6B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <FaCheckCircle size={40} />
          </div>

          <h1
            style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}
          >
            Payment Successful!
          </h1>
          <p style={{ fontSize: '14px', color: '#607D8B', marginBottom: '24px' }}>
            Your order has been confirmed and is waiting for a rider.
          </p>

          <div
            style={{
              background: '#F4FBFD',
              border: '1px solid #D8EEF5',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '28px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#607D8B' }}>Order Reference:</span>
              <strong style={{ color: '#263238', fontFamily: 'monospace' }}>
                #{orderId ? orderId.slice(-8) : 'N/A'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#607D8B' }}>Amount Paid:</span>
              <strong style={{ color: '#2E9E6B', fontSize: '16px' }}>
                {orderDetails?.amount || '—'} EGP
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#607D8B' }}>Payment Method:</span>
              <strong style={{ color: '#156B82' }}>
                {orderDetails?.paymentMethod || 'Online Card'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#607D8B' }}>Order Status:</span>
              <span
                style={{
                  background: '#FEF9E3',
                  color: '#C9A227',
                  fontWeight: '800',
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '10px',
                }}
              >
                Waiting for Rider
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {orderId && (
              <button
                onClick={() => navigate(`/track-orders/${orderId}`)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#156B82',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                View Track Order
              </button>
            )}
            <button
              onClick={() => navigate('/my-orders')}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #156B82',
                backgroundColor: '#ffffff',
                color: '#156B82',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Go to My Orders
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#FDECEC',
              color: '#E05252',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <FaExclamationCircle size={40} />
          </div>

          <h1
            style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}
          >
            Payment Not Completed
          </h1>
          <p style={{ fontSize: '14px', color: '#607D8B', marginBottom: '24px' }}>
            {errorMsg || 'Your transaction was cancelled or could not be processed by Paymob.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/new-order')}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#156B82',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Try Payment Again
            </button>
            <button
              onClick={() => navigate('/my-orders')}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #156B82',
                backgroundColor: '#ffffff',
                color: '#156B82',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Back to My Orders
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentResult;
