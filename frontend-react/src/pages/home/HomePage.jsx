import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyOrders } from '../../services/order.service';
import HomeGreeting from '../../components/home/HomeGreeting/HomeGreeting';
import HomeQuickActions from '../../components/home/HomeQuickActions/HomeQuickActions';
import ActiveOrder from '../../components/home/ActiveOrder/ActiveOrder';
import RecentOrders from '../../components/home/RecentOrders/RecentOrders';
import NearbyRiders from '../../components/home/NearbyRiders/NearbyRiders';
import './HomePage.css';

const ACTIVE_STATUSES = ['AVAILABLE', 'ACCEPTED', 'PICKED_UP'];

const HomePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOrders();
      const orderList = Array.isArray(data) ? data : data?.data || [];
      setOrders(orderList);
    } catch (err) {
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await getMyOrders();
        if (isMounted) {
          const orderList = Array.isArray(data) ? data : data?.data || [];
          setOrders(orderList);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load orders.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Derive active order (AVAILABLE, ACCEPTED, PICKED_UP)
  const activeOrder = orders.find((o) => ACTIVE_STATUSES.includes(o.status));

  // Exclude active order from recent orders list if active order exists
  const recentOrders = activeOrder
    ? orders.filter((o) => (o.id || o._id) !== (activeOrder.id || activeOrder._id))
    : orders;

  return (
    <main className="home-page-container" role="main" aria-label="Customer Home">
      {/* Section 1 — Greeting */}
      <HomeGreeting user={user} />

      {/* Section 2 & 3 — Primary Action & Quick Shortcuts */}
      <HomeQuickActions />

      {/* Section 4 — Active Order (Renders ONLY when an active order exists) */}
      {activeOrder && <ActiveOrder order={activeOrder} />}

      {/* Section 5 — Recent Orders */}
      <RecentOrders orders={recentOrders} loading={loading} error={error} onRetry={fetchOrders} />

      {/* Section 6 — Nearby Riders (LAST Section) */}
      <NearbyRiders />
    </main>
  );
};

export default HomePage;
