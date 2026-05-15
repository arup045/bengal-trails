// Location tracking utilities for Bengal Trails

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  code: number;
  message: string;
}

/**
 * Get user's current location using browser Geolocation API
 * Silently fails if permission is denied
 */
export function getCurrentLocation(): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by your browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let message = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        
        reject({
          code: error.code,
          message
        });
      },
      {
        enableHighAccuracy: false, // Use lower accuracy for better performance
        timeout: 5000, // Reduced timeout
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  });
}

/**
 * Watch user's location for continuous tracking
 */
export function watchLocation(
  onSuccess: (coords: LocationCoords) => void,
  onError?: (error: LocationError) => void
): number {
  if (!navigator.geolocation) {
    if (onError) {
      onError({
        code: 0,
        message: 'Geolocation is not supported by your browser'
      });
    }
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    (error) => {
      if (onError) {
        let message = 'Unable to track your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        
        onError({
          code: error.code,
          message
        });
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}

/**
 * Stop watching user's location
 */
export function stopWatchingLocation(watchId: number): void {
  if (navigator.geolocation && watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  from: LocationCoords,
  to: LocationCoords
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
    Math.cos(toRadians(to.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  } else if (distanceKm < 100) {
    return `${distanceKm.toFixed(1)}km away`;
  } else {
    return `${Math.round(distanceKm)}km away`;
  }
}

/**
 * Get destinations sorted by distance from user location
 */
export function sortByDistance(
  destinations: any[],
  userLocation: LocationCoords
): any[] {
  return destinations
    .map(dest => ({
      ...dest,
      distanceKm: dest.latitude && dest.longitude
        ? calculateDistance(userLocation, {
            latitude: dest.latitude,
            longitude: dest.longitude
          })
        : Infinity
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Filter destinations within a certain radius (in km)
 */
export function filterByRadius(
  destinations: any[],
  userLocation: LocationCoords,
  radiusKm: number
): any[] {
  return destinations.filter(dest => {
    if (!dest.latitude || !dest.longitude) return false;
    
    const distance = calculateDistance(userLocation, {
      latitude: dest.latitude,
      longitude: dest.longitude
    });
    
    return distance <= radiusKm;
  });
}

/**
 * Check if browser supports geolocation
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const coords = await getCurrentLocation();
    // Store last known location
    localStorage.setItem('last_known_location', JSON.stringify(coords));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get last known location from localStorage
 */
export function getLastKnownLocation(): LocationCoords | null {
  try {
    const stored = localStorage.getItem('last_known_location');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading last known location:', error);
  }
  return null;
}

/**
 * Get West Bengal center coordinates (for fallback)
 */
export function getWestBengalCenter(): LocationCoords {
  return {
    latitude: 22.9868,
    longitude: 87.8550
  };
}