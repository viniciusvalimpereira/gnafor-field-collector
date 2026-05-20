// Generic numeric guard (TODO §2 / Response letter §3.1).
// Rejects NaN, Infinity, and non-numeric tokens before any value is committed
// to localStorage. This is the lowest layer of the validation framework: the
// per-trait range checks in validation.js assume the value already passed here.

/**
 * True only for values that represent a finite real number.
 * Accepts JS numbers and numeric strings (locale-agnostic, dot decimal).
 * Rejects: NaN, Infinity/-Infinity, '', whitespace, 'abc', null, undefined,
 * booleans, objects, and arrays.
 * @param {*} value
 * @returns {boolean}
 */
export function isValidNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (s === '') return false;
    const n = Number(s);
    return Number.isFinite(n);
  }
  return false;
}

/**
 * Coerce to a finite number, or NaN if the input is not a valid number.
 * @param {*} value
 * @returns {number}
 */
export function toNumber(value) {
  return isValidNumber(value) ? Number(value) : NaN;
}

/**
 * True for non-negative integers within an inclusive upper bound (used by the
 * tiller-count and senescent-leaf rules, which must be whole numbers).
 * @param {*} value
 * @param {number} max inclusive upper bound
 * @returns {boolean}
 */
export function isCountInRange(value, max) {
  if (!isValidNumber(value)) return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= max;
}
