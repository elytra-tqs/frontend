export interface GeolocationCallbacks {
  onSuccess: (position: GeolocationPosition) => void;
  onError: (error: GeolocationPositionError) => void;
}

export function getCurrentPosition(callbacks: GeolocationCallbacks) {
  navigator.geolocation.getCurrentPosition(callbacks.onSuccess, callbacks.onError);
}

export function handleGeolocationError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "User denied the request for Geolocation.";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable.";
    case error.TIMEOUT:
      return "The request to get user location timed out.";
    default:
      return "An unknown error occurred.";
  }
}

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * @param point1 - First coordinate [latitude, longitude]
 * @param point2 - Second coordinate [latitude, longitude]
 * @returns Distance in kilometers
 */
export function getDistance(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}