import "./field.css"
const Field = ({ icon, value }) => {
  return (
    <div className="field">
      <span className="field-icon">{icon}</span>
      <input value={value} readOnly />
    </div>
  );
};

export default Field;