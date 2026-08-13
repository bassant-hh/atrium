import MapAdapter from './MapAdapter';

const TrackOrderMap = ({
  pickupDetails,
  destinationDetails,
  pickupString,
  destinationString,
  status,
  riderCoords, // Prepared for Future Live Tracking Phase!
}) => {
  const pickupCoords = pickupDetails?.coordinates;
  const destCoords = destinationDetails?.coordinates;

  const hasCoords = Boolean(pickupCoords || destCoords);
  const defaultCenter = pickupCoords || destCoords || { latitude: 26.1551, longitude: 32.716 };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #D8EEF5',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#263238' }}>🗺️ Order Delivery Map</h3>
        <span
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '16px',
            backgroundColor: '#E8EFFD',
            color: '#5B8DEF',
            fontWeight: '600',
          }}
        >
          {status || 'AVAILABLE'}
        </span>
      </div>

      {/* Map Adapter Layer */}
      <MapAdapter
        mode="tracking"
        center={defaultCenter}
        pickupCoords={pickupCoords}
        destCoords={destCoords}
        riderCoords={riderCoords}
        height="220px"
      />

      <div style={{ fontSize: '12px', color: '#607D8B' }}>
        {hasCoords ? (
          <span>
            📍 Pickup:{' '}
            {pickupCoords ? `(${pickupCoords.latitude}, ${pickupCoords.longitude})` : pickupString}{' '}
            • 🏁 Destination:{' '}
            {destCoords ? `(${destCoords.latitude}, ${destCoords.longitude})` : destinationString}
          </span>
        ) : (
          <span>
            📍 Pickup: {pickupString || 'Pickup Location'} • 🏁 Destination:{' '}
            {destinationString || 'Destination Location'}
          </span>
        )}
      </div>
    </div>
  );
};

export default TrackOrderMap;
