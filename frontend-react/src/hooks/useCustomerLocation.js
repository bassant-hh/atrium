import { useState, useCallback } from 'react';
import { getCustomerCurrentPosition } from '../services/location.service';

/**
 * Reusable Customer Location Hook
 * Provides explicit on-demand location requests for Customer React components.
 * Manages loading, normalized error state, and captured coordinates.
 */
export const useCustomerLocation = () => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const requestLocation = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    setStatusMessage('Requesting GPS location...');

    try {
      const position = await getCustomerCurrentPosition(options);
      setCoords(position);
      setLoading(false);
      setStatusMessage('Location captured via GPS ✓');
      return { success: true, coords: position };
    } catch (err) {
      setLoading(false);
      setError(err);
      setStatusMessage(err.message || 'Unable to retrieve GPS location.');
      return { success: false, error: err };
    }
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setError(null);
    setStatusMessage('');
  }, []);

  return {
    coords,
    loading,
    error,
    statusMessage,
    requestLocation,
    clearLocation,
  };
};

export default useCustomerLocation;
