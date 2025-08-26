export const coordinateToKey = (lat: number, lng: number, precision = 6): string => {
  return `${lat.toFixed(precision)},${lng.toFixed(precision)}`;
};

export const keyToCoordinate = (key: string): { lat: number; lng: number } => {
  const [lat, lng] = key.split(',').map(Number);
  return { lat, lng };
};

export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getBoundsFromPixels = (pixels: Array<{ latitude: number; longitude: number }>) => {
  if (pixels.length === 0) {
    return { north: 90, south: -90, east: 180, west: -180 };
  }

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  pixels.forEach(pixel => {
    north = Math.max(north, pixel.latitude);
    south = Math.min(south, pixel.latitude);
    east = Math.max(east, pixel.longitude);
    west = Math.min(west, pixel.longitude);
  });

  return { north, south, east, west };
};
