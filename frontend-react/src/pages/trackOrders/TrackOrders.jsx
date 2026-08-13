import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/order.service';
import {
  startRealtimeTracking,
  stopRealtimeTracking,
} from '../../services/realtimeTracking.service';
import { fetchRouteAndETA, shouldRecalculateRoute } from '../../services/routing.service';
import { Spinner, Alert, EmptyState } from '../../components/ui';
import TrackOrderMap from '../../components/map/TrackOrderMap';

const statusDisplayMap = {
  AVAILABLE: { label: 'Waiting for Rider', color: '#C9A227', background: '#FEF9E3' },
  ACCEPTED: { label: 'Rider Assigned', color: '#5B8DEF', background: '#E8EFFD' },
  PICKED_UP: { label: 'In Transit', color: '#0C6780', background: '#BAEAFF' },
  DELIVERED: { label: 'Delivered', color: '#2E9E6B', background: '#E6F7F0' },
  CANCELLED: { label: 'Cancelled', color: '#E05252', background: '#FDECEC' },
};

const formatDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
};

const TrackOrders = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riderCoords, setRiderCoords] = useState(null);

  // Controlled Routing & ETA State (Domain Level - Isolated from provider classes)
  const [routeData, setRouteData] = useState(null);
  const [etaInfo, setEtaInfo] = useState({
    durationText: null,
    distanceText: null,
    loading: false,
    error: null,
  });

  // Routing Recalculation & Stale Async Request Guards
  const currentOrderIdRef = useRef(id);
  const lastRoutedOriginRef = useRef(null);
  const lastRequestTimeRef = useRef(null);
  const lastTargetKeyRef = useRef(null);

  useEffect(() => {
    currentOrderIdRef.current = id;
  }, [id]);

  // Execute Route & ETA calculation based on controlled refresh policy
  const triggerRouteCalculation = useCallback(async (currentOrder, currentRiderPos) => {
    if (!currentOrder || !currentRiderPos) return;

    const status = currentOrder.status;
    if (status !== 'ACCEPTED' && status !== 'PICKED_UP') {
      setRouteData(null);
      setEtaInfo({ durationText: null, distanceText: null, loading: false, error: null });
      return;
    }

    // Determine target coordinates based on order lifecycle
    let targetCoords = null;
    if (status === 'ACCEPTED') {
      targetCoords = currentOrder.pickupLocationDetails?.coordinates;
    } else if (status === 'PICKED_UP') {
      targetCoords = currentOrder.destinationLocationDetails?.coordinates;
    }

    if (!targetCoords || targetCoords.latitude == null || targetCoords.longitude == null) {
      setRouteData(null);
      setEtaInfo({ durationText: null, distanceText: null, loading: false, error: null });
      return;
    }

    const targetKey = `${status}_${targetCoords.latitude}_${targetCoords.longitude}`;
    const targetChanged = lastTargetKeyRef.current !== targetKey;

    const needsRecalculation = shouldRecalculateRoute({
      lastRoutedOrigin: lastRoutedOriginRef.current,
      currentOrigin: currentRiderPos,
      lastRequestTime: lastRequestTimeRef.current,
      targetChanged,
      status,
    });

    if (!needsRecalculation) return;

    // Update control timestamps and target key
    lastRequestTimeRef.current = Date.now();
    lastRoutedOriginRef.current = currentRiderPos;
    lastTargetKeyRef.current = targetKey;

    setEtaInfo((prev) => ({ ...prev, loading: true, error: null }));

    const requestedOrderId = currentOrderIdRef.current;
    const result = await fetchRouteAndETA({
      origin: currentRiderPos,
      destination: targetCoords,
    });

    // Stale response guard: ensure order hasn't switched during async computation
    if (currentOrderIdRef.current !== requestedOrderId) return;

    if (result.success) {
      setRouteData({
        routeObject: result.routeObject,
        path: result.path,
      });
      setEtaInfo({
        durationText: result.durationText,
        distanceText: result.distanceText,
        loading: false,
        error: null,
      });
    } else {
      setEtaInfo((prev) => ({
        ...prev,
        loading: false,
        error: result.error || 'ETA temporarily unavailable',
      }));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchOrderDetails = async (isInitial = false) => {
      if (!id) return;
      try {
        if (isInitial) setLoading(true);
        const data = await getOrderById(id);

        if (isMounted) {
          setOrder(data);
          setError(null);

          const status = data?.status;

          // Connect / Disconnect Realtime Rider Location Tracking based on lifecycle status
          if (status === 'ACCEPTED' || status === 'PICKED_UP') {
            startRealtimeTracking(
              id,
              (coords) => {
                if (isMounted) {
                  setRiderCoords(coords);
                  triggerRouteCalculation(data, coords);
                }
              },
              (_trackingErr) => {
                // Realtime tracking warnings are non-blocking
              },
            );
          } else if (status === 'DELIVERED' || status === 'CANCELLED' || status === 'AVAILABLE') {
            stopRealtimeTracking();
            setRouteData(null);
            setEtaInfo({ durationText: null, distanceText: null, loading: false, error: null });
            if (intervalId && (status === 'DELIVERED' || status === 'CANCELLED')) {
              clearInterval(intervalId);
            }
          }
        }
      } catch (err) {
        if (isMounted && isInitial) {
          setError(err.message || 'Failed to load order details');
        }
      } finally {
        if (isMounted && isInitial) {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails(true);

    // Setup 5000ms polling interval for active order status
    intervalId = setInterval(() => {
      fetchOrderDetails(false);
    }, 5000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      stopRealtimeTracking();
      lastRoutedOriginRef.current = null;
      lastRequestTimeRef.current = null;
      lastTargetKeyRef.current = null;
    };
  }, [id, triggerRouteCalculation]);

  const currentStatus = order?.status || 'AVAILABLE';
  const statusConfig = statusDisplayMap[currentStatus] || {
    label: currentStatus,
    color: '#666',
    background: '#eee',
  };

  const isCancelled = currentStatus === 'CANCELLED';

  const placedDate = formatDate(order?.createdAt);
  const acceptedDate = formatDate(order?.acceptedAt);
  const deliveredDate = formatDate(order?.deliveredAt);

  // Timeline step statuses
  const isPlacedDone = Boolean(placedDate || order?.createdAt);
  const isAcceptedDone = Boolean(acceptedDate || order?.acceptedAt);
  const isInTransitDone = currentStatus === 'PICKED_UP' || currentStatus === 'DELIVERED';
  const isDeliveredDone = Boolean(
    deliveredDate || order?.deliveredAt || currentStatus === 'DELIVERED',
  );

  return (
    <div style={{ padding: '24px 16px', maxWidth: '960px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#263238' }}>Track Order</h1>
          <p style={{ margin: '4px 0 0 0', color: '#607D8B', fontSize: '14px' }}>
            Order Tracking Details
          </p>
        </div>
        <button
          onClick={() => navigate('/my-orders')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #D8EEF5',
            background: '#ffffff',
            color: '#156B82',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ← Back to Orders
        </button>
      </div>

      {loading && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner size="lg" />
          <p style={{ color: '#607D8B', marginTop: '16px' }}>Loading order tracking details...</p>
        </div>
      )}

      {error && <Alert type="error" message={error} />}

      {!loading && !error && !order && (
        <EmptyState
          title="Order Not Found"
          description="The requested order could not be found or you do not have permission to view it."
        />
      )}

      {!loading && !error && order && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Card */}
          <div
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #D8EEF5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#263238' }}>
                {order.title || 'Order Request'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#607D8B', fontSize: '14px' }}>
                {order.category || 'General'} •{' '}
                {order.amount != null ? `${order.amount} SAR` : 'N/A'}
              </p>
            </div>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '13px',
                backgroundColor: statusConfig.background,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Cancellation Alert */}
          {isCancelled && (
            <Alert
              type="error"
              message="This order has been cancelled and will not proceed through delivery."
            />
          )}

          {/* Integrated Track Order Delivery Map */}
          <TrackOrderMap
            pickupDetails={order.pickupLocationDetails}
            destinationDetails={order.destinationLocationDetails}
            pickupString={order.pickup}
            destinationString={order.destination}
            status={currentStatus}
            riderCoords={riderCoords}
            routeData={routeData}
            etaInfo={etaInfo}
          />

          {/* Main Grid: Timeline + Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Timeline Section */}
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #D8EEF5',
              }}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#263238' }}>
                Order Lifecycle Timeline
              </h3>

              <ol
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {/* Step 1: Placed */}
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isPlacedDone ? '#156B82' : '#e0e0e0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#263238' }}>Order Placed</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#607D8B' }}>
                      {placedDate || 'Order submitted'}
                    </p>
                  </div>
                </li>

                {/* Step 2: Rider Assigned */}
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isAcceptedDone ? '#156B82' : '#e0e0e0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    {isAcceptedDone ? '✓' : '2'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#263238' }}>
                      Rider Assigned
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#607D8B' }}>
                      {acceptedDate || 'Waiting for a rider'}
                    </p>
                  </div>
                </li>

                {/* Step 3: In Transit */}
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isInTransitDone ? '#156B82' : '#e0e0e0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    {isInTransitDone ? '✓' : '3'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#263238' }}>In Transit</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#607D8B' }}>
                      {currentStatus === 'PICKED_UP'
                        ? 'Order is on the way'
                        : isDeliveredDone
                          ? 'Completed'
                          : 'Pending'}
                    </p>
                  </div>
                </li>

                {/* Step 4: Delivered */}
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isDeliveredDone ? '#2E9E6B' : '#e0e0e0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    {isDeliveredDone ? '✓' : '4'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#263238' }}>Delivered</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#607D8B' }}>
                      {deliveredDate || 'Pending'}
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Details Section */}
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #D8EEF5',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#263238' }}>
                Delivery Details
              </h3>

              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#607D8B' }}>
                  Pickup Location
                </p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#263238' }}>
                  {order.pickup || order.pickupLocation}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#607D8B' }}>
                  Destination
                </p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#263238' }}>
                  {order.destination || order.deliveryLocation}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#607D8B' }}>
                  Estimated Time
                </p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#263238' }}>
                  {etaInfo.durationText || order.estimatedTime || '15 mins'}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#607D8B' }}>
                  Total Amount Paid
                </p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#156B82' }}>
                  {order.amount != null ? `${order.amount} SAR` : 'N/A'}
                </p>
              </div>

              {order.notes && (
                <div style={{ borderTop: '1px solid #D8EEF5', paddingTop: '12px' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#607D8B' }}>
                    Special Instructions
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#263238' }}>{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrders;
