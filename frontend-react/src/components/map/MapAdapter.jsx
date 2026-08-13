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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,routes`;
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
  riderCoords,
  routeData,
  onPositionChange,
  height = '220px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const pickerMarkerRef = useRef(null);
  const polylinesRef = useRef([]);

  const [providerState, setProviderState] = useState('initializing'); // 'google' | 'fallback' | 'initializing'
  const [currentCoords, setCurrentCoords] = useState(center);

  useEffect(() => {
    setCurrentCoords(center);
  }, [center.latitude, center.longitude]);

  // Clean up polylines from current map instance
  const clearPolylines = () => {
    if (polylinesRef.current && polylinesRef.current.length > 0) {
      polylinesRef.current.forEach((pl) => {
        if (pl && typeof pl.setMap === 'function') {
          pl.setMap(null);
        }
      });
      polylinesRef.current = [];
    }
  };

  // 1. Initialize Google Maps instance once when SDK and container are ready
  useEffect(() => {
    let isMounted = true;
    const apiKey = APP_CONFIG.googleMapsApiKey;

    if (!apiKey) {
      setProviderState('fallback');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then((maps) => {
        if (!isMounted || !mapContainerRef.current) return;

        setProviderState('google');

        if (!mapInstanceRef.current) {
          const mapInstance = new maps.Map(mapContainerRef.current, {
            center: { lat: center.latitude, lng: center.longitude },
            zoom: 15,
            disableDefaultUI: false,
            zoomControl: true,
          });
          mapInstanceRef.current = mapInstance;
        }
      })
      .catch((err) => {
        console.warn('Google Maps SDK load error, switching to interactive fallback:', err);
        if (isMounted) setProviderState('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, [mode]);

  // 2. Manage Picker Mode Marker & Drag Listeners
  useEffect(() => {
    if (providerState !== 'google' || mode !== 'picker' || !mapInstanceRef.current) return;
    const maps = window.google.maps;
    const mapInstance = mapInstanceRef.current;

    const latLng = { lat: center.latitude, lng: center.longitude };

    if (!pickerMarkerRef.current) {
      const marker = new maps.Marker({
        position: latLng,
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

      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setPosition(latLng);
    }
  }, [providerState, mode, center.latitude, center.longitude, onPositionChange]);

  // 3. Manage Tracking Mode Markers (Pickup & Destination) and Initial Bounds
  useEffect(() => {
    if (providerState !== 'google' || mode !== 'tracking' || !mapInstanceRef.current) return;
    const maps = window.google.maps;
    const mapInstance = mapInstanceRef.current;
    const bounds = new maps.LatLngBounds();
    let hasPoint = false;

    // Pickup Marker
    if (pickupCoords && pickupCoords.latitude != null && pickupCoords.longitude != null) {
      const pPos = { lat: pickupCoords.latitude, lng: pickupCoords.longitude };
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = new maps.Marker({
          position: pPos,
          map: mapInstance,
          title: 'Pickup Location',
          label: '📍',
        });
      } else {
        pickupMarkerRef.current.setPosition(pPos);
      }
      bounds.extend(pPos);
      hasPoint = true;
    }

    // Destination Marker
    if (destCoords && destCoords.latitude != null && destCoords.longitude != null) {
      const dPos = { lat: destCoords.latitude, lng: destCoords.longitude };
      if (!destMarkerRef.current) {
        destMarkerRef.current = new maps.Marker({
          position: dPos,
          map: mapInstance,
          title: 'Destination Location',
          label: '🏁',
        });
      } else {
        destMarkerRef.current.setPosition(dPos);
      }
      bounds.extend(dPos);
      hasPoint = true;
    }

    if (hasPoint && !mapInstance._initialBoundsFitted) {
      mapInstance.fitBounds(bounds, 50);
      mapInstance._initialBoundsFitted = true;
    }
  }, [providerState, mode, pickupCoords, destCoords]);

  // 4. Manage Realtime Rider Marker (Updates position dynamically without map teardown or fitBounds jumping)
  useEffect(() => {
    if (providerState !== 'google' || mode !== 'tracking' || !mapInstanceRef.current) return;
    const maps = window.google.maps;
    const mapInstance = mapInstanceRef.current;

    if (riderCoords && riderCoords.latitude != null && riderCoords.longitude != null) {
      const rPos = { lat: Number(riderCoords.latitude), lng: Number(riderCoords.longitude) };

      if (!riderMarkerRef.current) {
        riderMarkerRef.current = new maps.Marker({
          position: rPos,
          map: mapInstance,
          title: 'Rider Location',
          label: '🛵',
          zIndex: 999,
        });
      } else {
        riderMarkerRef.current.setPosition(rPos);
      }
    } else if (riderMarkerRef.current) {
      riderMarkerRef.current.setMap(null);
      riderMarkerRef.current = null;
    }
  }, [providerState, mode, riderCoords?.latitude, riderCoords?.longitude]);

  // 5. Render Route Polyline using Google Maps Routes Library
  useEffect(() => {
    if (providerState !== 'google' || mode !== 'tracking' || !mapInstanceRef.current) return;
    const maps = window.google.maps;
    const mapInstance = mapInstanceRef.current;

    clearPolylines();

    if (!routeData) return;

    // Check if routeObject provides createPolylines() (Google Maps Route instance)
    const routeObj = routeData.routeObject;
    if (routeObj && typeof routeObj.createPolylines === 'function') {
      try {
        const polylines = routeObj.createPolylines();
        if (Array.isArray(polylines)) {
          polylines.forEach((pl) => {
            pl.setMap(mapInstance);
          });
          polylinesRef.current = polylines;
          return;
        }
      } catch {
        // Fallback to manual Polyline drawing if createPolylines fails
      }
    }

    // Manual Polyline rendering from route path coordinates
    const path = routeData.path;
    if (Array.isArray(path) && path.length > 0) {
      const polyline = new maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#156B82',
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: mapInstance,
      });
      polylinesRef.current = [polyline];
    }
  }, [providerState, mode, routeData]);

  // Clean up all map elements on unmount
  useEffect(() => {
    return () => {
      clearPolylines();
      if (pickupMarkerRef.current) pickupMarkerRef.current.setMap(null);
      if (destMarkerRef.current) destMarkerRef.current.setMap(null);
      if (riderMarkerRef.current) riderMarkerRef.current.setMap(null);
      if (pickerMarkerRef.current) pickerMarkerRef.current.setMap(null);
      mapInstanceRef.current = null;
    };
  }, []);

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
        ref={mapContainerRef}
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

          {/* Rider position indicator if live tracking in fallback mode */}
          {riderCoords && (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 6 }}
            >
              <div style={{ fontSize: '28px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))' }}>
                🛵
              </div>
              <div
                style={{
                  background: '#E65100',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: '700',
                  marginTop: '2px',
                }}
              >
                Rider
              </div>
            </div>
          )}

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
