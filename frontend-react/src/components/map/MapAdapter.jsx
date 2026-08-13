import { useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '../../config/app.config';

let googleMapsScriptPromise = null;

const loadGoogleMapsScript = (apiKey) => {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }
  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps SDK failed to load.'));
        }
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }
  return googleMapsScriptPromise;
};

const MapAdapter = ({
  mode = 'picker',
  center = { latitude: 26.1551, longitude: 32.716 },
  pickupCoords,
  destCoords,
  riderCoords, // Prepared for future Live Rider Tracking phase!
  onPositionChange,
  height = '220px',
}) => {
  const mapRef = useRef(null);
  const [providerState, setProviderState] = useState('initializing'); // 'google' | 'fallback' | 'initializing'
  const [currentCoords, setCurrentCoords] = useState(center);

  useEffect(() => {
    setCurrentCoords(center);
  }, [center.latitude, center.longitude]);

  // Attempt Google Maps initialization if API key is present
  useEffect(() => {
    let isMounted = true;
    const apiKey = APP_CONFIG.googleMapsApiKey;

    if (!apiKey) {
      setProviderState('fallback');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then((maps) => {
        if (!isMounted || !mapRef.current) return;

        setProviderState('google');

        const mapInstance = new maps.Map(mapRef.current, {
          center: { lat: center.latitude, lng: center.longitude },
          zoom: 15,
          disableDefaultUI: false,
          zoomControl: true,
        });

        if (mode === 'picker') {
          const marker = new maps.Marker({
            position: { lat: center.latitude, lng: center.longitude },
            map: mapInstance,
            draggable: true,
            title: 'Selected Location',
          });

          marker.addListener('dragend', (event) => {
            const lat = Number(event.latLng.lat().toFixed(6));
            const lng = Number(event.latLng.lng().toFixed(6));
            const newPos = { latitude: lat, longitude: lng };
            setCurrentCoords(newPos);
            if (onPositionChange) onPositionChange(newPos);
          });
        } else if (mode === 'tracking') {
          const bounds = new maps.LatLngBounds();

          if (pickupCoords) {
            const pPos = { lat: pickupCoords.latitude, lng: pickupCoords.longitude };
            new maps.Marker({
              position: pPos,
              map: mapInstance,
              title: 'Pickup Location',
              label: '📍',
            });
            bounds.extend(pPos);
          }

          if (destCoords) {
            const dPos = { lat: destCoords.latitude, lng: destCoords.longitude };
            new maps.Marker({
              position: dPos,
              map: mapInstance,
              title: 'Destination Location',
              label: '🏁',
            });
            bounds.extend(dPos);
          }

          // Prepared for Future Live Tracking Phase!
          if (riderCoords) {
            const rPos = { lat: riderCoords.latitude, lng: riderCoords.longitude };
            new maps.Marker({
              position: rPos,
              map: mapInstance,
              title: 'Rider Location',
              label: '🛵',
            });
            bounds.extend(rPos);
          }

          if (pickupCoords || destCoords || riderCoords) {
            mapInstance.fitBounds(bounds, 50);
          }
        }
      })
      .catch((err) => {
        console.warn('Google Maps SDK load error, switching to interactive fallback:', err);
        if (isMounted) setProviderState('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, [mode, center.latitude, center.longitude, pickupCoords, destCoords, riderCoords]);

  const handlePan = (dLat, dLng) => {
    const updated = {
      latitude: Number((currentCoords.latitude + dLat).toFixed(6)),
      longitude: Number((currentCoords.longitude + dLng).toFixed(6)),
    };
    setCurrentCoords(updated);
    if (onPositionChange) onPositionChange(updated);
  };

  // Render Google Maps Container if SDK loaded
  if (providerState === 'google') {
    return (
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: height,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #D8EEF5',
        }}
      />
    );
  }

  // Render Interactive Fallback Map Engine (OpenStreetMap Tiles)
  return (
    <div
      style={{
        position: 'relative',
        height: height,
        width: '100%',
        backgroundColor: '#e5e3df',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #c0d5df',
        backgroundImage:
          'linear-gradient(#d3e7ee 1px, transparent 1px), linear-gradient(90deg, #d3e7ee 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {mode === 'picker' && (
        <>
          {/* Centered Fixed Pin */}
          <div
            style={{
              position: 'absolute',
              zIndex: 10,
              fontSize: '32px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
            }}
          >
            📍
          </div>

          {/* Coordinates Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(255, 255, 255, 0.94)',
              padding: '4px 10px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#263238',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Lat: {currentCoords.latitude.toFixed(4)}, Lng: {currentCoords.longitude.toFixed(4)}
          </div>

          {/* Pan Control Buttons */}
          <div
            style={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 28px)',
              gap: '4px',
              background: 'rgba(255,255,255,0.92)',
              padding: '4px',
              borderRadius: '8px',
            }}
          >
            <div />
            <button type="button" onClick={() => handlePan(0.001, 0)} style={panBtnStyle}>
              ▲
            </button>
            <div />
            <button type="button" onClick={() => handlePan(0, -0.001)} style={panBtnStyle}>
              ◄
            </button>
            <button type="button" onClick={() => handlePan(-0.001, 0)} style={panBtnStyle}>
              ▼
            </button>
            <button type="button" onClick={() => handlePan(0, 0.001)} style={panBtnStyle}>
              ►
            </button>
          </div>
        </>
      )}

      {mode === 'tracking' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            width: '100%',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Pickup Marker */}
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}
          >
            <div style={{ fontSize: '28px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))' }}>
              📍
            </div>
            <div
              style={{
                background: '#156B82',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                marginTop: '4px',
              }}
            >
              Pickup
            </div>
          </div>

          <div
            style={{
              flex: 1,
              height: '2px',
              borderTop: '2px dashed #156B82',
              margin: '0 12px',
              opacity: 0.7,
            }}
          />

          {/* Destination Marker */}
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}
          >
            <div style={{ fontSize: '28px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))' }}>
              🏁
            </div>
            <div
              style={{
                background: '#2E9E6B',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                marginTop: '4px',
              }}
            >
              Destination
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const panBtnStyle = {
  border: '1px solid #ccc',
  background: '#fff',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '10px',
  fontWeight: 'bold',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default MapAdapter;
