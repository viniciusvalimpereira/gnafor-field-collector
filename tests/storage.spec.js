import { describe, it, expect } from 'vitest';
import {
  byteLength, usageBytes, usageRatio, usageLevel, safeParse,
  purgeTransmitted, recordsUntilWarning,
  PRACTICAL_QUOTA_BYTES, SOFT_THRESHOLD, HARD_THRESHOLD
} from '../src/storage.js';

// Minimal Storage stand-in
function fakeStorage(obj) {
  return { getItem: (k) => (k in obj ? obj[k] : null) };
}

describe('byteLength (UTF-8)', () => {
  it('counts ASCII as 1 byte and diacritics as 2+', () => {
    expect(byteLength('abc')).toBe(3);
    expect(byteLength('ção')).toBe(5);       // ç=2, ã=2, o=1
    expect(byteLength('')).toBe(0);
  });
});

describe('usage accounting', () => {
  it('sums bytes across the app keys', () => {
    const s = fakeStorage({ 'dunamis-altura': '[{"medida1":"12"}]' });
    expect(usageBytes(s)).toBeGreaterThan(0);
  });

  it('maps ratios to soft/hard levels at 70% / 90%', () => {
    expect(usageLevel(0.5)).toBe('ok');
    expect(usageLevel(SOFT_THRESHOLD)).toBe('soft');
    expect(usageLevel(0.8)).toBe('soft');
    expect(usageLevel(HARD_THRESHOLD)).toBe('hard');
    expect(usageLevel(1.2)).toBe('hard');
  });

  it('computes ratio against the practical quota', () => {
    const big = 'x'.repeat(Math.round(PRACTICAL_QUOTA_BYTES * 0.95));
    const s = fakeStorage({ 'dunamis-morfo': big });
    expect(usageRatio(s)).toBeGreaterThan(HARD_THRESHOLD);
  });
});

describe('safeParse (round-trip + malformed)', () => {
  it('round-trips serialized records', () => {
    const records = [{ id: 'a', medida1: '12', enviado: false }];
    expect(safeParse(JSON.stringify(records), [])).toEqual(records);
  });

  it('returns the fallback on malformed or null JSON', () => {
    expect(safeParse('{not json', [])).toEqual([]);
    expect(safeParse(null, [])).toEqual([]);
    expect(safeParse('null', [])).toEqual([]);
  });
});

describe('purgeTransmitted', () => {
  it('keeps only records not yet sent', () => {
    const recs = [
      { id: '1', enviado: true },
      { id: '2', enviado: false },
      { id: '3' }
    ];
    const kept = purgeTransmitted(recs);
    expect(kept.map((r) => r.id)).toEqual(['2', '3']);
  });

  it('is safe on non-arrays', () => {
    expect(purgeTransmitted(null)).toEqual([]);
  });
});

describe('recordsUntilWarning', () => {
  it('estimates remaining capacity before the soft cap', () => {
    expect(recordsUntilWarning(0, 420)).toBe(Math.floor(PRACTICAL_QUOTA_BYTES * SOFT_THRESHOLD / 420));
    expect(recordsUntilWarning(PRACTICAL_QUOTA_BYTES, 420)).toBe(0);
  });
});
