// localStorage capacity accounting + safe (de)serialization (TODO §3 / §4).
//
// The reviewer asked how many records realistically fit in localStorage. We
// account usage against a conservative 4 MB practical mobile quota and expose
// soft/hard thresholds (70% / 90%) that the header gauge and the forced-sync
// logic consume. All functions are pure and take the storage object as an
// argument so they are unit-testable without a real browser.

export const STORAGE_KEYS = [
  'dunamis-morfo', 'dunamis-perf', 'dunamis-prod', 'dunamis-altura', 'dunamis-pending'
];

// Conservative practical limit per origin on mobile browsers (Response §3.2).
export const PRACTICAL_QUOTA_BYTES = 4 * 1024 * 1024; // 4 MB
export const SOFT_THRESHOLD = 0.70;
export const HARD_THRESHOLD = 0.90;

/** UTF-8 byte length of a string (diacritics count as 2+ bytes). */
export function byteLength(str) {
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff) { bytes += 4; i++; } // surrogate pair
    else bytes += 3;
  }
  return bytes;
}

/** Total bytes used by the app's keys in the given storage. */
export function usageBytes(storage, keys = STORAGE_KEYS) {
  let total = 0;
  for (const k of keys) {
    const v = storage.getItem(k);
    if (v != null) total += byteLength(k) + byteLength(v);
  }
  return total;
}

/** Fraction of the practical quota in use (0..1+). */
export function usageRatio(storage, quota = PRACTICAL_QUOTA_BYTES, keys = STORAGE_KEYS) {
  return usageBytes(storage, keys) / quota;
}

/** 'ok' | 'soft' | 'hard' for a given usage ratio. */
export function usageLevel(ratio) {
  if (ratio >= HARD_THRESHOLD) return 'hard';
  if (ratio >= SOFT_THRESHOLD) return 'soft';
  return 'ok';
}

/** Parse JSON without throwing; returns fallback on malformed or null input. */
export function safeParse(json, fallback) {
  if (json == null) return fallback;
  try {
    const v = JSON.parse(json);
    return v === null ? fallback : v;
  } catch (_e) {
    return fallback;
  }
}

/**
 * Drop records already transmitted to Google Sheets (enviado === true).
 * Used to reclaim space automatically after a successful sync/export.
 */
export function purgeTransmitted(records) {
  if (!Array.isArray(records)) return [];
  return records.filter((r) => !r || r.enviado !== true);
}

/** How many more records of a given average byte size fit before the soft cap. */
export function recordsUntilWarning(currentBytes, avgRecordBytes, quota = PRACTICAL_QUOTA_BYTES) {
  if (avgRecordBytes <= 0) return Infinity;
  const remaining = quota * SOFT_THRESHOLD - currentBytes;
  return Math.max(0, Math.floor(remaining / avgRecordBytes));
}
