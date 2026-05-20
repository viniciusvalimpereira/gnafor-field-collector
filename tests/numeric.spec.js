import { describe, it, expect } from 'vitest';
import { isValidNumber, toNumber, isCountInRange } from '../src/numeric.js';

describe('isValidNumber (generic numeric guard, TODO §2)', () => {
  it('accepts finite numbers', () => {
    expect(isValidNumber(0)).toBe(true);
    expect(isValidNumber(12.5)).toBe(true);
    expect(isValidNumber(-25)).toBe(true);      // valid number; range is validation.js's job
    expect(isValidNumber(1_000_000)).toBe(true);
  });

  it('accepts numeric strings', () => {
    expect(isValidNumber('12.5')).toBe(true);
    expect(isValidNumber('  7 ')).toBe(true);
    expect(isValidNumber('0')).toBe(true);
  });

  it('rejects NaN and Infinity', () => {
    expect(isValidNumber(NaN)).toBe(false);
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber(-Infinity)).toBe(false);
  });

  it('rejects non-numeric tokens and empties', () => {
    expect(isValidNumber('abc')).toBe(false);
    expect(isValidNumber('')).toBe(false);
    expect(isValidNumber('   ')).toBe(false);
    expect(isValidNumber('12cm')).toBe(false);
  });

  it('rejects non-number, non-string types', () => {
    expect(isValidNumber(null)).toBe(false);
    expect(isValidNumber(undefined)).toBe(false);
    expect(isValidNumber(true)).toBe(false);
    expect(isValidNumber({})).toBe(false);
    expect(isValidNumber([])).toBe(false);
  });
});

describe('toNumber', () => {
  it('coerces valid input and returns NaN otherwise', () => {
    expect(toNumber('3.14')).toBe(3.14);
    expect(toNumber(42)).toBe(42);
    expect(Number.isNaN(toNumber('x'))).toBe(true);
    expect(Number.isNaN(toNumber(Infinity))).toBe(true);
  });
});

describe('isCountInRange (integer counts)', () => {
  it('accepts non-negative integers within bound', () => {
    expect(isCountInRange(0, 9999)).toBe(true);
    expect(isCountInRange(9999, 9999)).toBe(true);
    expect(isCountInRange('5', 99)).toBe(true);
  });

  it('rejects negatives, overflow, and non-integers', () => {
    expect(isCountInRange(-1, 9999)).toBe(false);
    expect(isCountInRange(10000, 9999)).toBe(false);
    expect(isCountInRange(2.5, 99)).toBe(false);
    expect(isCountInRange('abc', 99)).toBe(false);
  });
});
