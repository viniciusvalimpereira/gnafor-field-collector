import { describe, it, expect } from 'vitest';
import { isGeolocationAvailable, emptyGpsFields, gpsFieldsFromPosition } from '../src/gps.js';

describe('GPS capture fallback (TODO §4 / Response §3.3)', () => {
  it('detects whether Geolocation is usable', () => {
    expect(isGeolocationAvailable({ geolocation: { getCurrentPosition() {} } })).toBe(true);
    expect(isGeolocationAvailable({})).toBe(false);
    expect(isGeolocationAvailable(null)).toBe(false);
    expect(isGeolocationAvailable({ geolocation: {} })).toBe(false); // no getCurrentPosition
  });

  it('maps a valid position to GPS fields', () => {
    const f = gpsFieldsFromPosition({ coords: { latitude: -20.13, longitude: -44.88, accuracy: 8 } });
    expect(f).toEqual({ gps_lat: -20.13, gps_lng: -44.88, gps_acc: 8 });
  });

  it('falls back to empty fields when no fix is available', () => {
    expect(gpsFieldsFromPosition(null)).toEqual({ gps_lat: '', gps_lng: '', gps_acc: '' });
    expect(gpsFieldsFromPosition(undefined)).toEqual(emptyGpsFields());
    expect(gpsFieldsFromPosition({})).toEqual(emptyGpsFields());
    expect(gpsFieldsFromPosition({ coords: {} })).toEqual(emptyGpsFields());
  });
});
