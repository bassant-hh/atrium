import { useState } from 'react';
import MapAdapter from './MapAdapter';
import { useCustomerLocation } from '../../hooks/useCustomerLocation';

const DEFAULT_CENTER = {
  latitude: 26.1551,
  longitude: 32.716,
};

const LocationPickerMap = ({
  locationName,
  initialCoords,
  onSelectLocation,
  onAddressGeocoded,
}) => {
  const [coords, setCoords] = useState(initialCoords || DEFAULT_CENTER);
  const [geocodedAddress, setGeocodedAddress] = useState('');

  const { loading: isLocating, statusMessage: gpsStatus, requestLocation } = useCustomerLocation();

  const performReverseGeocode = async (newCoords) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoords.latitude}&lon=${newCoords.longitude}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setGeocodedAddress(data.display_name);
          if (onAddressGeocoded) {
            onAddressGeocoded(data.display_name);
          }
        }
      }
    } catch {
      // Reverse geocoding failure is non-blocking
      console.info('Reverse geocoding lookup unavailable; continuing with coordinate selection.');
    }
  };

  const handlePositionChange = (newCoords) => {
    setCoords(newCoords);
    if (onSelectLocation) {
      onSelectLocation(newCoords);
    }
    performReverseGeocode(newCoords);
  };

  const handleGetCurrentLocation = async () => {
    const result = await requestLocation({ timeout: 10000, enableHighAccuracy: true });
    if (result && result.success && result.coords) {
      handlePositionChange(result.coords);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #D8EEF5',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '15px', color: '#263238' }}>📍 Select Location on Map</h4>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid #156B82',
            background: '#F4FBFD',
            color: '#156B82',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {isLocating ? 'Locating...' : '🎯 Use My Current Location'}
        </button>
      </div>

      {gpsStatus && (
        <div
          style={{
            fontSize: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor:
              gpsStatus.includes('denied') || gpsStatus.includes('Unable') ? '#FEF9E3' : '#E6F7F0',
            color:
              gpsStatus.includes('denied') || gpsStatus.includes('Unable') ? '#C9A227' : '#2E9E6B',
            fontWeight: '600',
          }}
        >
          {gpsStatus}
        </div>
      )}

      {/* Map Adapter Layer */}
      <MapAdapter
        mode="picker"
        center={coords}
        onPositionChange={handlePositionChange}
        height="220px"
      />

      {geocodedAddress && (
        <div
          style={{
            fontSize: '11px',
            color: '#156B82',
            background: '#F4FBFD',
            padding: '6px 10px',
            borderRadius: '8px',
          }}
        >
          🌐 <strong>Geocoded Address:</strong> {geocodedAddress}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#607D8B' }}>
        Position target area under the pin to set exact coordinates for{' '}
        <strong>{locationName}</strong>.
      </div>
    </div>
  );
};

export default LocationPickerMap;
