import React from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import ProtectedRoute from './ProtectedRoute.jsx';

import HomePage from '../pages/home/HomePage.jsx';
import MyOrders from '../pages/MyOrders/MyOrders.jsx';
import TrackOrders from '../pages/trackOrders/TrackOrders.jsx';
import Notification from '../pages/notification/Notification.jsx';
import Profile from '../pages/profile/Profile.jsx';
import NewPage from '../pages/newPage/NewPage.jsx';

export const dashboardRoutes = (
  <>
    <Route path={ROUTES.HOME} element={<HomePage />} />

    {/* Protected Dashboard Routes */}
    <Route
      path={ROUTES.CUSTOMER_PROFILE}
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.PROFILE}
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.MY_ORDERS}
      element={
        <ProtectedRoute>
          <MyOrders />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.TRACK_ORDERS}
      element={
        <ProtectedRoute>
          <TrackOrders />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.NOTIFICATIONS}
      element={
        <ProtectedRoute>
          <Notification />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.NEW_ORDER}
      element={
        <ProtectedRoute>
          <NewPage />
        </ProtectedRoute>
      }
    />
  </>
);
