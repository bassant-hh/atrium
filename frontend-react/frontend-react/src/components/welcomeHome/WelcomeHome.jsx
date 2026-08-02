import { FaBox } from "react-icons/fa";
import "./WelcomeHome.css";

const WelcomeHome = ({
  name = "Ahmed",
  onNewOrder,
}) => {
  return (
    <div className="welcome-wrapper">
      <div className="welcome-text">
        <h1 className="welcome-title">Welcome back, {name}</h1>

        <p className="welcome-subtitle">
          What would you like to order today?
        </p>
      </div>

      <button className="new-order-btn" onClick={onNewOrder}>
        <FaBox className="btn-icon" />
        New Order
      </button>
    </div>
  );
};

export default WelcomeHome;