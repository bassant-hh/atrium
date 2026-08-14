/**
 * Customer Location Service
 * Reusable abstraction over browser Geolocation API.
 * Provides explicit, one-time position capture with normalized error objects and coordinates.
 */

export const LOCATION_ERROR_CODES = {
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

const ERROR_MESSAGES = {
  [LOCATION_ERROR_CODES.NOT_SUPPORTED]: 'Geolocation is not supported by your browser.',
  [LOCATION_ERROR_CODES.PERMISSION_DENIED]:
    'GPS permission denied. Please adjust location manually.',
  [LOCATION_ERROR_CODES.POSITION_UNAVAILABLE]:
    'Unable to retrieve GPS location. Please choose manually.',
  [LOCATION_ERROR_CODES.TIMEOUT]: 'Location request timed out. Please try again.',
  [LOCATION_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred while fetching location.',
};

/**
 * Normalizes raw browser GeolocationPosition object into standard app coordinates shape.
 */
export const normalizeCoordinates = (position) => {
  if (!position || !position.coords) return null;
  return {
    latitude: Number(position.coords.latitude.toFixed(6)),
    longitude: Number(position.coords.longitude.toFixed(6)),
  };
};

/**
 * Normalizes raw browser GeolocationPositionError into application error representation.
 */
export const normalizeLocationError = (error) => {
  if (!error) {
    return {
      code: LOCATION_ERROR_CODES.UNKNOWN_ERROR,
      message: ERROR_MESSAGES[LOCATION_ERROR_CODES.UNKNOWN_ERROR],
    };
  }

  let code = LOCATION_ERROR_CODES.UNKNOWN_ERROR;
  if (typeof error === 'object' && 'code' in error) {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        code = LOCATION_ERROR_CODES.PERMISSION_DENIED;
        break;
      case 2: // POSITION_UNAVAILABLE
        code = LOCATION_ERROR_CODES.POSITION_UNAVAILABLE;
        break;
      case 3: // TIMEOUT
        code = LOCATION_ERROR_CODES.TIMEOUT;
        break;
      default:
        code = LOCATION_ERROR_CODES.UNKNOWN_ERROR;
        break;
    }
  }

  return {
    code,
    message: ERROR_MESSAGES[code] || ERROR_MESSAGES[LOCATION_ERROR_CODES.UNKNOWN_ERROR],
  };
};

/**
 * Explicit one-time browser geolocation request.
 * Returns Promise resolving to normalized coordinates or rejecting with normalized location error object.
 */
export const getCustomerCurrentPosition = (
  options = { timeout: 10000, enableHighAccuracy: true },
) => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject({
        code: LOCATION_ERROR_CODES.NOT_SUPPORTED,
        message: ERROR_MESSAGES[LOCATION_ERROR_CODES.NOT_SUPPORTED],
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const normalized = normalizeCoordinates(position);
        if (normalized) {
          resolve(normalized);
        } else {
          reject({
            code: LOCATION_ERROR_CODES.UNKNOWN_ERROR,
            message: ERROR_MESSAGES[LOCATION_ERROR_CODES.UNKNOWN_ERROR],
          });
        }
      },
      (error) => {
        reject(normalizeLocationError(error));
      },
      options,
    );
  });
};
