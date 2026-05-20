// Per-trait input validation (TODO §2 / Response letter §3.1, Table 3).
//
// A declarative schema drives every check, so new traits are added by editing
// TRAITS only — no changes to the form-rendering code. Two severity levels:
//   hard  → biologically impossible; blocks the save.
//   soft  → unusual but possible (e.g. an exceptionally tall canopy under
//           deferred grazing); prompts a confirm-to-save dialog.
//
// validateValue() is i18n-agnostic: it returns a structured result with a
// `code` and the relevant bounds; the app layer turns that into a localized
// message via t(). This keeps the module unit-testable in isolation.

import { isValidNumber, toNumber } from './numeric.js';

export const TRAITS = {
  // hard [min,max]            soft (warn_min..warn_max)
  canopy_height:    { min: 0, max: 500,   warn_min: 5, warn_max: 250, type: 'float', unit: 'cm' },
  leaf_blade:       { min: 0, max: 200,   warn_min: 1, warn_max: 120, type: 'float', unit: 'cm' },
  pseudostem:       { min: 0, max: 80,    warn_min: 1, warn_max: 50,  type: 'float', unit: 'cm' },
  tiller_count:     { min: 0, max: 9999,  type: 'int' },
  senescent_leaves: { min: 0, max: 99,    type: 'int' },
  mass_g:           { min: 0, max: 50000, warn_min: 50, warn_max: 20000, type: 'float', unit: 'g', exclusiveMin: true },
  gps_accuracy:     { min: 0, warn_max: 100, type: 'float', unit: 'm' }
};

/**
 * Validate one raw value against a trait's schema.
 * @param {string} traitKey  a key of TRAITS
 * @param {*} raw            the raw field value (string from an <input>, or number)
 * @returns {{level:'ok'|'soft'|'hard'|'empty', code?:string, traitKey:string,
 *            value?:number, min?:number, max?:number, warn_min?:number,
 *            warn_max?:number, unit?:string}}
 */
export function validateValue(traitKey, raw, schema = TRAITS) {
  const spec = schema[traitKey];
  if (!spec) throw new Error('Unknown trait: ' + traitKey);

  // Empty is handled by a separate "required/empty fields" UX layer.
  if (raw === '' || raw === null || raw === undefined) {
    return { level: 'empty', traitKey };
  }

  if (!isValidNumber(raw)) {
    return { level: 'hard', code: 'not_number', traitKey, value: raw };
  }

  const n = toNumber(raw);

  if (spec.type === 'int' && !Number.isInteger(n)) {
    return { level: 'hard', code: 'not_integer', traitKey, value: n, unit: spec.unit };
  }

  const belowMin = spec.exclusiveMin ? n <= spec.min : n < spec.min;
  const aboveMax = spec.max !== undefined && n > spec.max;
  if (belowMin || aboveMax) {
    return {
      level: 'hard', code: 'out_of_range', traitKey, value: n,
      min: spec.min, max: spec.max, unit: spec.unit
    };
  }

  const warnLow = spec.warn_min !== undefined && n < spec.warn_min;
  const warnHigh = spec.warn_max !== undefined && n > spec.warn_max;
  if (warnLow || warnHigh) {
    return {
      level: 'soft', code: 'unusual', traitKey, value: n,
      warn_min: spec.warn_min, warn_max: spec.warn_max, unit: spec.unit
    };
  }

  return { level: 'ok', traitKey, value: n };
}

/**
 * Validate a list of fields and split results by severity.
 * @param {Array<{traitKey:string, raw:*, label?:string}>} items
 * @returns {{hard:Array, soft:Array}}
 */
export function validateBatch(items, schema = TRAITS) {
  const hard = [];
  const soft = [];
  for (const item of items) {
    const r = validateValue(item.traitKey, item.raw, schema);
    r.label = item.label;
    if (r.level === 'hard') hard.push(r);
    else if (r.level === 'soft') soft.push(r);
  }
  return { hard, soft };
}
