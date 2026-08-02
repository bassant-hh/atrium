import StatusBadge from "../statusBadge/StatusBadge";
import "./RecentOrders.css";

const RecentOrders = ({
  title = "Recent Orders",
  orders = [],
  currency = "SAR",
}) => {
  return (
    <div className="orders-wrapper">
      <h2 className="orders-title">{title}</h2>

      <div className="orders-card">
        <div className="orders-header">
          <span>Order ID</span>
          <span>Item</span>
          <span>Status</span>
          <span>Time</span>
          <span>Amount</span>
        </div>

        {(orders || []).map((order) => (
          <div key={order.id} className="orders-row">
            <span className="order-id">#{order.id}</span>
            <span>{order.item}</span>

            <StatusBadge status={order.status} />

            <span className="muted">{order.time}</span>

            <span className="amount">
              {`${order.amount} ${currency}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;