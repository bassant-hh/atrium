import React from "react";
import { FaBox, FaClock, FaLocationArrow, FaStar } from "react-icons/fa";

import { BACKEND_URL } from "../../../../options";

import StatusCard from "../../components/card/Card";
import CategoryCard from "../../components/categoryCard/Category";
import DriverCard from "../../components/DriverCard/DriverCard";
import RecentOrders from "../../components/RecentOrders/RecentOrders";
import WelcomeHome from "../../components/welcomeHome/WelcomeHome";
import { useNavigate } from "react-router-dom";

console.log(BACKEND_URL);

// constant right now until the backend send the endpoints
const PRIMARY_COLOR = "#3b889d";

const categories = [
  {
    id: "food",
    icon: "🍕",
    iconBg: "#BAEAFF",
    title: "Food & Drinks",
    orderCount: 45,
    badgeColor: "#0C6780",
    badgeBg: "#BAEAFF",
  },
  {
    id: "printing",
    icon: "🖨️",
    iconBg: "#BAEAFF",
    title: "Printing",
    orderCount: 120,
    badgeColor: "#0C6780",
    badgeBg: "#BAEAFF",
  },
  {
    id: "stationary",
    icon: "✏️",
    iconBg: "#BAEAFF",
    title: "Stationary",
    orderCount: 88,
    badgeColor: "#0C6780",
    badgeBg: "#BAEAFF",
  },
  {
    id: "books",
    icon: "📚",
    iconBg: "#BAEAFF",
    title: "Books",
    orderCount: 32,
    badgeColor: "#0C6780",
    badgeBg: "#BAEAFF",
  },
];

const drivers = [
  {
    id: "mohammed",
    name: "Mohammed A.",
    distance: "0.5 km away",
    rating: 4.9,
    isOnline: true,
    avatarColor: "#BAEAFF",
    avatarTextColor: "#004D62",
  },
  {
    id: "fatima",
    name: "Fatima S.",
    distance: "0.8 km away",
    rating: 4.8,
    isOnline: true,
  },
  {
    id: "khalid",
    name: "Khalid M.",
    distance: "1.2 km away",
    rating: 4.7,
    isOnline: false,
  },
];

const sampleOrders = [
  {
    id: "M1234",
    item: "Chicken Shawarma",
    status: "Delivered",
    time: "2h ago",
    amount: 25,
  },
  {
    id: "M1235",
    item: "Print Documents",
    status: "In Progress",
    time: "30m ago",
    amount: 5,
  },
  {
    id: "M1236",
    item: "Notebook & Pens",
    status: "Pending",
    time: "1h ago",
    amount: 15,
  },
  {
    id: "M1237",
    item: "Water Bottles x6",
    status: "Cancelled",
    time: "3h ago",
    amount: 18,
  },
];

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
};

const HomePage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    navigate("/new-order");
  };
  return (
    <div className="container py-4">
      <WelcomeHome />

      {/* Status Cards */}
      <div className="d-flex flex-wrap gap-3 mb-5">
        <StatusCard
          title="Total Orders"
          count={24}
          icon={FaBox}
          color={PRIMARY_COLOR}
        />
        <StatusCard
          title="In Progress"
          count={2}
          icon={FaClock}
          color={PRIMARY_COLOR}
        />
        <StatusCard
          title="Completed"
          count={22}
          icon={FaStar}
          color={PRIMARY_COLOR}
        />
        <StatusCard
          title="Total Spent"
          count={`${24}$`}
          icon={FaLocationArrow}
          color={PRIMARY_COLOR}
        />
      </div>

      {/* Main Grid */}
      <div className="row g-4 mt-4">
        <div className="col-lg-8 d-flex flex-column gap-5">
          {/* Categories */}
          <div>
            <h3 className="mb-4">Categories</h3>

            <div style={gridStyle}>
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  {...cat}
                  onClick={() => handleCategoryClick()}
                />
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <RecentOrders
            title="Recent Orders"
            orders={sampleOrders}
            currency="SAR"
          />
        </div>

        {/* Drivers */}
        <div className="col-lg-4">
          <h3 className="mb-4">Nearby Drivers</h3>

          <div className="d-flex flex-column gap-3">
            {drivers.map((driver) => (
              <DriverCard key={driver.id} {...driver} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
