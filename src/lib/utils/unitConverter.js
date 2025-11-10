/**
 * @param {number} decimal - Decimal coordinate value
 * @param {boolean} isLatitude - true for lat, false for lon
 * @returns {object} - {degrees, minutes, seconds, direction}
 */
export function decimalToDMS(decimal, isLatitude) {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);
  
  let direction;
  if (isLatitude) {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }
  
  return { degrees, minutes, seconds, direction };
}

/**
 * @param {number} degrees
 * @param {number} minutes
 * @param {number} seconds
 * @param {string} direction - 'N', 'S', 'E', or 'W'
 * @returns {number}
 */
export function dmsToDecimal(degrees, minutes, seconds, direction) {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  // Apply negative sign for South and West
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
}

/**
 * Format DMS as string
 */
export function formatDMS(dms) {
  return `${dms.degrees}° ${dms.minutes}' ${dms.seconds}" ${dms.direction}`;
}