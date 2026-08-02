const Toggle = ({ on, onToggle }) => {
  return (
    <div
      className={`toggle ${on ? "active" : ""}`}
      onClick={onToggle}
    >
      <div className="toggle-circle" />
    </div>
  );
};

export default Toggle;