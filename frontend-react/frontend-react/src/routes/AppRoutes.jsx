import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/home/HomePage.jsx";
import Myorders from "../pages/MyOrders/Myorders.jsx";
import TrackOrders from "../pages/trackOrders/TrackOrders.jsx";
import Notification from "../pages/notification/Notification.jsx";
import Profile from "../pages/profile/Profile.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";
import NewPage from "../pages/newPage/NewPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/my-orders" element={<Myorders />} />
      <Route path="/track-orders/:id" element={<TrackOrders />} />
      <Route path="/notifications" element={<Notification />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/new-order" element={<NewPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
