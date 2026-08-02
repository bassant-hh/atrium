import { useParams } from "react-router-dom";

const TrackOrders = () => {
  const { id } = useParams();

  return (
    <div style={{ padding: "30px" }}>
      <h1>Track Order</h1>
      <p>Order ID: {id}</p>
    </div>
  );
};

export default TrackOrders;