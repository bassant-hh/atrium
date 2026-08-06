import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import GuestRoute from './GuestRoute.jsx';

import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

export const authRoutes = (
  <>
    <Route
      path={ROUTES.CUSTOMER_LOGIN}
      element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      }
    />
    <Route
      path={ROUTES.CUSTOMER_REGISTER}
      element={
        <GuestRoute>
          <Register />
        </GuestRoute>
      }
    />

    {/* Canonical Route Aliases */}
    <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.CUSTOMER_LOGIN} replace />} />
    <Route path={ROUTES.REGISTER} element={<Navigate to={ROUTES.CUSTOMER_REGISTER} replace />} />
  </>
);
