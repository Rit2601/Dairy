/**
 * Haversine formula to calculate distance between two coordinates (km)
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  const toRad = (value) => (value * Math.PI) / 180;
  
  const isWithinDeliveryRadius = (userLat, userLng) => {
    const dairyLat = parseFloat(process.env.DAIRY_LAT);
    const dairyLng = parseFloat(process.env.DAIRY_LNG);
    const radius = parseFloat(process.env.DELIVERY_RADIUS_KM) || 5;
    const distance = calculateDistance(dairyLat, dairyLng, userLat, userLng);
    return { inRange: distance <= radius, distance: distance.toFixed(2) };
  };
  
  module.exports = { calculateDistance, isWithinDeliveryRadius };