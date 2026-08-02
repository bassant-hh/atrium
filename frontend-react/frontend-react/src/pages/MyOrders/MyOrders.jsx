import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

import { BACKEND_URL } from "../../../../options";

const ORDERS = [
  {
    id: "M1240",
    title: "Chicken Shawarma",
    category: "Food",
    status: "Delivered",
    amount: 25,
    pickupLocation: "Building A, Cafeteria",
    deliveryLocation: "Building C, Room 205",
    date: "Apr 17, 2026 at 2:30 PM",
  },
  {
    id: "M1239",
    title: "Print Documents",
    category: "Printing",
    status: "Delivered",
    amount: 7.5,
    pickupLocation: "Print Shop",
    deliveryLocation: "Library",
    date: "Apr 16, 2026 at 11:00 AM",
  },
  {
    id: "M1238",
    title: "Notebook & Pens",
    category: "Stationery",
    status: "In Progress",
    amount: 15,
    pickupLocation: "Campus Store",
    deliveryLocation: "Dorm",
    date: "Apr 19, 2026 at 9:15 AM",
  },
  {
    id: "M1237",
    title: "Falafel Wrap",
    category: "Food",
    status: "Pending",
    amount: 18,
    pickupLocation: "Cafeteria",
    deliveryLocation: "Engineering Hall",
    date: "Apr 19, 2026 at 10:00 AM",
  },
];

const statusStyles = {
  Delivered: { color: "#2E9E6B", background: "#E6F7F0" },
  "In Progress": { color: "#5B8DEF", background: "#E8EFFD" },
  Pending: { color: "#C9A227", background: "#FEF9E3" },
};

const StatusBadge = ({ status }) => {
  const style = statusStyles[status] || {
    color: "#666",
    background: "#eee",
  };

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: style.background,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
};

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  return (
    <div className="order-card">
      <div className="order-left">
        <h3>{order.title}</h3>

        <p className="order-meta">
          #{order.id} • {order.category}
        </p>

        <div className="order-meta">
          <p>
            <strong>Pickup:</strong> {order.pickupLocation}
          </p>
          <p>
            <strong>Delivery:</strong> {order.deliveryLocation}
          </p>
        </div>
      </div>

      <div className="order-center">
        <StatusBadge status={order.status} />
        <p className="order-meta">{order.date}</p>
      </div>

      <div className="order-right">
        <h3 className="order-amount">{order.amount} SAR</h3>

        <button
          className="track-btn"
          onClick={() => navigate(`/track-orders/${order.id}`)}
        >
          Track
        </button>
      </div>
    </div>
  );
};

const MyOrders = () => {
  //const [filter, setFilter] = useState("All");

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/order/getOrders`, { credentials: "include" })
      .then((res) => res.json())
      .then((res) => {
        setOrders(res.data);
      });
  });

  /*const filteredOrders =
    filter === "All"
      ? ORDERS
      : ORDERS.filter((order) => order.status === filter);*/

  return (
    <div className="my-orders-page">
      <div className="orders-header">
        <div>
          <h1>My Orders</h1>
          <p>Track all your orders</p>
        </div>

        <button className="new-order-btn">+ New Order</button>
      </div>

      <div className="orders-filters">
        {["All", "Pending", "In Progress", "Delivered"].map((item) => (
          <button
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
