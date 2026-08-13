import MapAdapter from './MapAdapter';

const TrackOrderMap = ({
  pickupDetails,
  destinationDetails,
  pickupString,
  destinationString,
  status, // Raw status code e.g. ACCEPTED, PICKED_UP, AVAILABLE, DELIVERED, CANCELLED
  riderCoords,
  routeData,
  etaInfo = {},
}) => {
  const pickupCoords = pickupDetails?.coordinates;
  const destCoords = destinationDetails?.coordinates;

  const hasCoords = Boolean(pickupCoords || destCoords);
  const defaultCenter = pickupCoords || destCoords || { latitude: 26.1551, longitude: 32.716 };

  const { durationText, distanceText, loading: etaLoading, error: etaError } = etaInfo;
  const isRoutingActive = status === 'ACCEPTED' || status === 'PICKED_UP';

  // Construct semantic ETA message
  const getEtaBannerMessage = () => {
    if (!isRoutingActive) return null;
    if (etaLoading) return 'Updating route & ETA...';
    if (etaError) return 'ETA temporarily unavailable';

    if (!durationText) return null;

    const distancePart = distanceText ? `${distanceText} · ` : '';
    if (status === 'ACCEPTED') {
      return `Rider arriving at pickup · ${distancePart}${durationText}`;
    }
    if (status === 'PICKED_UP') {
      return `Estimated delivery · ${distancePart}${durationText}`;
    }
    return `Estimated arrival · ${distancePart}${durationText}`;
  };

  const etaMessage = getEtaBannerMessage();

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
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', color: '#263238' }}>🗺️ Order Delivery Map</h3>
        <span
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '16px',
            backgroundColor: status === 'DELIVERED' ? '#E6F7F0' : '#E8EFFD',
            color: status === 'DELIVERED' ? '#2E9E6B' : '#5B8DEF',
            fontWeight: '600',
          }}
        >
          {status || 'AVAILABLE'}
        </span>
      </div>

      {/* Dynamic ETA / Route Banner (Mobile-First) */}
      {isRoutingActive && etaMessage && (
        <div
          style={{
            background: etaError ? '#FEF9E3' : '#156B82',
            color: etaError ? '#C9A227' : '#ffffff',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{etaError ? '⚠️' : '⏱️'}</span>
            <span>{etaMessage}</span>
          </div>
          {etaLoading && (
            <span style={{ fontSize: '11px', opacity: 0.8, fontStyle: 'italic' }}>Updating...</span>
          )}
        </div>
      )}

      {/* Map Adapter Layer */}
      <MapAdapter
        mode="tracking"
        center={defaultCenter}
        pickupCoords={pickupCoords}
        destCoords={destCoords}
        riderCoords={riderCoords}
        routeData={routeData}
        height="240px"
      />

      {/* Map Footer Coordinates / Details */}
      <div style={{ fontSize: '12px', color: '#607D8B', wordBreak: 'break-word' }}>
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
