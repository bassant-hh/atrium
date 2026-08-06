import React from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

import LandingPage from '../pages/landing/LandingPage.jsx';
import RoleSelection from '../pages/RoleSelection/RoleSelection.jsx';
import NotFound from '../pages/NotFound/NotFound.jsx';

export const publicRoutes = (
  <>
    <Route index element={<LandingPage />} />
    <Route path={ROUTES.PORTAL} element={<RoleSelection />} />
    <Route path="*" element={<NotFound />} />
  </>
);
