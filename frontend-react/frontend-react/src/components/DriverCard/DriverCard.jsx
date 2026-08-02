import "./DriverCard.css";
import { FaStar } from "react-icons/fa";

const DriverCard = ({
  name = "Mohammed A.",
  distance = "0.5 km away",
  rating = 4.9,
  isOnline = true,
  avatarColor = "#BAEAFF",
  avatarTextColor = "#004D62",
  onClick,
}) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="driver-card" onClick={onClick}>
      <div className={`status-dot ${isOnline ? "online" : "offline"}`} />

      <div className="driver-top">
        <div
          className="avatar"
          style={{
            backgroundColor: avatarColor,
            color: avatarTextColor,
          }}
        >
          {initial}
        </div>

        <div className="driver-info">
          <span className="driver-name">{name}</span>
          <span className="driver-distance">{distance}</span>
        </div>
      </div>

      <div className="driver-rating">
        <FaStar style={{ color: "#0C6780" }} />
        <span className="rating">{rating.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default DriverCard;