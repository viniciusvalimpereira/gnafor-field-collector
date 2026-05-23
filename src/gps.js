// GPS capture helpers and fallback paths (TODO §4 / Response §3.3).
//
// captureGPS in the app calls navigator.geolocation; these pure helpers make
// the availability check and the position->fields mapping unit-testable,
// including the fallback when Geolocation is unavailable or denied.

/** True only when the environment exposes a usable Geolocation API. */
export function isGeolocationAvailable(nav) {
  return !!(nav && typeof nav === 'object' && nav.geolocation &&
    typeof nav.geolocation.getCurrentPosition === 'function');
}

/** Empty GPS fields — the fallback when no fix is available. */
export function emptyGpsFields() {
  return { gps_lat: '', gps_lng: '', gps_acc: '' };
}

/**
 * Map a Geolocation position to the record's GPS fields. Returns empty fields
 * for a malformed/absent position (fallback path).
 * @param {GeolocationPosition|null|undefined} position
 */
export function gpsFieldsFromPosition(position) {
  if (!position || !position.coords) return emptyGpsFields();
  const c = position.coords;
  return {
    gps_lat: typeof c.latitude === 'number' ? c.latitude : '',
    gps_lng: typeof c.longitude === 'number' ? c.longitude : '',
    gps_acc: typeof c.accuracy === 'number' ? c.accuracy : ''
  };
}
