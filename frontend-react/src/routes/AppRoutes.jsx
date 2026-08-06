import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

import RoleSelection from '../pages/RoleSelection/RoleSelection.jsx';
import HomePage from '../pages/home/HomePage.jsx';
import MyOrders from '../pages/MyOrders/MyOrders.jsx';
import TrackOrders from '../pages/trackOrders/TrackOrders.jsx';
import Notification from '../pages/notification/Notification.jsx';
import Profile from '../pages/profile/Profile.jsx';
import NotFound from '../pages/NotFound/NotFound.jsx';
import NewPage from '../pages/newPage/NewPage.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Layout Routes (No Sidebar, No Dashboard Header) */}
      <Route element={<PublicLayout />}>
        <Route index element={<RoleSelection />} />
        <Route path={ROUTES.CUSTOMER_LOGIN} element={<Login />} />
        <Route path={ROUTES.CUSTOMER_REGISTER} element={<Register />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Main Dashboard Layout Routes (Sidebar + Header + Dashboard Container) */}
      <Route element={<MainLayout />}>
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
      </Route>
    </Routes>
  );
};

export default AppRoutes;
