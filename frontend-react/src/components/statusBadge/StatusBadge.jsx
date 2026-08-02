import "./StatusBadge.css";

const statusStyles = {
  Delivered: { color: "#3A9E6F", bg: "#E6F7F0" },
  "In Progress": { color: "#5B8DEF", bg: "#E8EFFD" },
  Pending: { color: "#C9A227", bg: "#FEF9E3" },
  Cancelled: { color: "#E05252", bg: "#FDECEC" },
};

const StatusBadge = ({ status }) => {
  const style = statusStyles[status] || {
    color: "#888",
    bg: "#f0f0f0",
  };

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;