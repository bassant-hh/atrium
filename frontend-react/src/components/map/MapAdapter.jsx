/**
 * MapAdapter — Leaflet + OpenStreetMap implementation
 * Replaces previous Google Maps-based map provider.
 *
 * Modes:
 *   'picker'   — Interactive location selector with coordinate display
 *   'tracking' — Live order tracking: pickup, destination, rider markers + OSRM route polyline
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { APP_CONFIG } from '../../config/app.config';

// Leaflet's default marker icon assets break with Vite; fix paths inline.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidCoord = (c) => {
  if (!c) return false;
  const lat = Number(c.latitude);
  const lon = Number(c.longitude);
  return isFinite(lat) && isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

const toLatLng = (c) => [Number(c.latitude), Number(c.longitude)];

const makeEmojiIcon = (emoji) =>
  L.divIcon({
    className: 'makook-emoji-marker',
    html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 3px 5px rgba(0,0,0,0.35));">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

const PICKUP_ICON = makeEmojiIcon('📍');
const DEST_ICON = makeEmojiIcon('🏁');
const RIDER_ICON = makeEmojiIcon('🛵');

// ─── Component ────────────────────────────────────────────────────────────────

const MapAdapter = ({
  mode = 'picker',
  center = { latitude: 26.1551, longitude: 32.716 },
  pickupCoords,
  destCoords,
  riderCoords,
  routeData,
  onPositionChange,
  height = '240px',
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarker = useRef(null);
  const destMarker = useRef(null);
  const riderMarker = useRef(null);
  const pickerMarker = useRef(null);
  const routePolyline = useRef(null);
  const boundsFittedRef = useRef(false);

  // For fallback picker mode coordinate display
  const [pickerCoords, setPickerCoords] = useState(center);

  // ── 1. Mount Leaflet map once ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const tileUrl = APP_CONFIG.osmTileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const map = L.map(containerRef.current, {
      center: isValidCoord(center) ? toLatLng(center) : [26.1551, 32.716],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Picker mode: draggable center marker
    if (mode === 'picker' && isValidCoord(center)) {
      const m = L.marker(toLatLng(center), {
        icon: PICKUP_ICON,
        draggable: true,
      }).addTo(map);

      m.on('dragend', (e) => {
        const latlng = e.target.getLatLng();
        const pos = {
          latitude: Number(latlng.lat.toFixed(6)),
          longitude: Number(latlng.lng.toFixed(6)),
        };
        setPickerCoords(pos);
        if (onPositionChange) onPositionChange(pos);
      });

      pickerMarker.current = m;
    }

    // Force Leaflet to recalculate the container size after mount
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 100);

    return () => {
      // Cleanup on unmount
      if (routePolyline.current) {
        routePolyline.current.remove();
        routePolyline.current = null;
      }
      if (pickupMarker.current) {
        pickupMarker.current.remove();
        pickupMarker.current = null;
      }
      if (destMarker.current) {
        destMarker.current.remove();
        destMarker.current = null;
      }
      if (riderMarker.current) {
        riderMarker.current.remove();
        riderMarker.current = null;
      }
      if (pickerMarker.current) {
        pickerMarker.current.remove();
        pickerMarker.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      boundsFittedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Tracking markers: Pickup + Destination ──────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mode !== 'tracking') return;
    const map = mapRef.current;
    const bounds = [];

    // Pickup marker
    if (isValidCoord(pickupCoords)) {
      const pos = toLatLng(pickupCoords);
      if (!pickupMarker.current) {
        pickupMarker.current = L.marker(pos, { icon: PICKUP_ICON }).addTo(map);
      } else {
        pickupMarker.current.setLatLng(pos);
      }
      bounds.push(pos);
    } else if (pickupMarker.current) {
      pickupMarker.current.remove();
      pickupMarker.current = null;
    }

    // Destination marker
    if (isValidCoord(destCoords)) {
      const pos = toLatLng(destCoords);
      if (!destMarker.current) {
        destMarker.current = L.marker(pos, { icon: DEST_ICON }).addTo(map);
      } else {
        destMarker.current.setLatLng(pos);
      }
      bounds.push(pos);
    } else if (destMarker.current) {
      destMarker.current.remove();
      destMarker.current = null;
    }

    // Fit map to pickup+destination on initial load only
    if (bounds.length > 0 && !boundsFittedRef.current) {
      try {
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch {
        // fitBounds can throw on single-point bounds; ignore
      }
      boundsFittedRef.current = true;
    }
  }, [mode, pickupCoords, destCoords]);

  // ── 3. Rider marker (updates dynamically) ─────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mode !== 'tracking') return;

    if (isValidCoord(riderCoords)) {
      const pos = toLatLng(riderCoords);
      if (!riderMarker.current) {
        riderMarker.current = L.marker(pos, { icon: RIDER_ICON, zIndexOffset: 1000 }).addTo(
          mapRef.current,
        );
      } else {
        riderMarker.current.setLatLng(pos);
      }
    } else if (riderMarker.current) {
      riderMarker.current.remove();
      riderMarker.current = null;
    }
  }, [mode, riderCoords?.latitude, riderCoords?.longitude]);

  // ── 4. Route polyline from OSRM routeData ─────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mode !== 'tracking') return;

    // Clear existing polyline
    if (routePolyline.current) {
      routePolyline.current.remove();
      routePolyline.current = null;
    }

    // routeData.path is [[lat, lon], ...] already converted by routing.service.js
    if (routeData?.path && Array.isArray(routeData.path) && routeData.path.length > 1) {
      routePolyline.current = L.polyline(routeData.path, {
        color: '#156B82',
        weight: 5,
        opacity: 0.82,
        lineJoin: 'round',
      }).addTo(mapRef.current);
    }
  }, [mode, routeData]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: height,
          minHeight: height,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #D8EEF5',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Picker mode coordinate overlay */}
      {mode === 'picker' && (
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            zIndex: 1000,
            background: 'rgba(255,255,255,0.94)',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#263238',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
          }}
        >
          Lat: {pickerCoords.latitude.toFixed(4)}, Lng: {pickerCoords.longitude.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default MapAdapter;
