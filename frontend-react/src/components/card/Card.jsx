import "./StatusCard.css";

const StatusCard = ({ title, count, icon: Icon, color }) => {
  return (
    <div className="status-card">
      
      <div className="card-top">
        <span className="card-title ">{title}</span>

        <div
          className="card-icon"
          style={{ color: color, borderColor: color }}
        >
          {Icon && <Icon size={18} />}
        </div>
      </div>

      <h1 className="card-number">{count}</h1>
    </div>
  );
};

export default StatusCard;