import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

import { publicRoutes } from './public.routes.jsx';
import { authRoutes } from './auth.routes.jsx';
import { dashboardRoutes } from './dashboard.routes.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public & Guest Layout Container */}
      <Route element={<PublicLayout />}>
        {publicRoutes}
        {authRoutes}
      </Route>

      {/* Main Authenticated Dashboard Shell */}
      <Route element={<MainLayout />}>{dashboardRoutes}</Route>
    </Routes>
  );
};

export default AppRoutes;
