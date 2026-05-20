import { describe, it, expect } from 'vitest';
import { TRAITS, validateValue, validateBatch } from '../src/validation.js';

describe('validateValue — canopy height (Table 3; reviewer examples)', () => {
  it('blocks the reviewer-reported impossible values', () => {
    // The two values Reviewer #1 entered during testing:
    expect(validateValue('canopy_height', -25)).toMatchObject({ level: 'hard', code: 'out_of_range' });
    expect(validateValue('canopy_height', 1_000_000)).toMatchObject({ level: 'hard', code: 'out_of_range' });
    expect(validateValue('canopy_height', '1000000')).toMatchObject({ level: 'hard', code: 'out_of_range' });
  });

  it('accepts plausible values inside the soft band', () => {
    expect(validateValue('canopy_height', 100)).toMatchObject({ level: 'ok' });
    expect(validateValue('canopy_height', 5)).toMatchObject({ level: 'ok' });
    expect(validateValue('canopy_height', 250)).toMatchObject({ level: 'ok' });
  });

  it('warns (soft) on unusual-but-possible values within the hard range', () => {
    expect(validateValue('canopy_height', 0)).toMatchObject({ level: 'soft', code: 'unusual' });   // below warn_min 5
    expect(validateValue('canopy_height', 300)).toMatchObject({ level: 'soft', code: 'unusual' });  // above warn_max 250
    expect(validateValue('canopy_height', 500)).toMatchObject({ level: 'soft' });                   // hard max, soft high
  });
});

describe('validateValue — numeric guard integration', () => {
  it('rejects non-numeric and non-finite values as hard', () => {
    expect(validateValue('canopy_height', 'abc')).toMatchObject({ level: 'hard', code: 'not_number' });
    expect(validateValue('canopy_height', '')).toMatchObject({ level: 'empty' });
    expect(validateValue('canopy_height', NaN)).toMatchObject({ level: 'hard', code: 'not_number' });
    expect(validateValue('canopy_height', Infinity)).toMatchObject({ level: 'hard', code: 'not_number' });
  });
});

describe('validateValue — integer counts', () => {
  it('requires whole numbers within bounds', () => {
    expect(validateValue('tiller_count', 5)).toMatchObject({ level: 'ok' });
    expect(validateValue('tiller_count', 0)).toMatchObject({ level: 'ok' });
    expect(validateValue('tiller_count', 9999)).toMatchObject({ level: 'ok' });
    expect(validateValue('tiller_count', 2.5)).toMatchObject({ level: 'hard', code: 'not_integer' });
    expect(validateValue('tiller_count', -1)).toMatchObject({ level: 'hard', code: 'out_of_range' });
    expect(validateValue('tiller_count', 10000)).toMatchObject({ level: 'hard', code: 'out_of_range' });
    expect(validateValue('senescent_leaves', 100)).toMatchObject({ level: 'hard', code: 'out_of_range' });
    expect(validateValue('senescent_leaves', 99)).toMatchObject({ level: 'ok' });
  });
});

describe('validateValue — dry/fresh mass (exclusive lower bound)', () => {
  it('rejects zero and negative mass; warns outside the soft band', () => {
    expect(validateValue('mass_g', 0)).toMatchObject({ level: 'hard', code: 'out_of_range' });    // exclusiveMin
    expect(validateValue('mass_g', -10)).toMatchObject({ level: 'hard', code: 'out_of_range' });
    expect(validateValue('mass_g', 25)).toMatchObject({ level: 'soft' });                          // below warn_min 50
    expect(validateValue('mass_g', 30000)).toMatchObject({ level: 'soft' });                       // above warn_max 20000
    expect(validateValue('mass_g', 5000)).toMatchObject({ level: 'ok' });
    expect(validateValue('mass_g', 50001)).toMatchObject({ level: 'hard', code: 'out_of_range' });
  });
});

describe('validateValue — leaf blade and pseudostem', () => {
  it('applies their distinct ranges', () => {
    expect(validateValue('leaf_blade', 200)).toMatchObject({ level: 'soft' });   // hard max 200, warn_max 120
    expect(validateValue('leaf_blade', 201)).toMatchObject({ level: 'hard' });
    expect(validateValue('pseudostem', 60)).toMatchObject({ level: 'soft' });    // within hard 80, above warn 50
    expect(validateValue('pseudostem', 81)).toMatchObject({ level: 'hard' });
  });
});

describe('validateValue — GPS accuracy', () => {
  it('warns above 100 m, blocks negatives', () => {
    expect(validateValue('gps_accuracy', 8)).toMatchObject({ level: 'ok' });
    expect(validateValue('gps_accuracy', 150)).toMatchObject({ level: 'soft', code: 'unusual' });
    expect(validateValue('gps_accuracy', -1)).toMatchObject({ level: 'hard', code: 'out_of_range' });
  });
});

describe('validateValue — guards', () => {
  it('throws on an unknown trait', () => {
    expect(() => validateValue('not_a_trait', 1)).toThrow(/Unknown trait/);
  });
});

describe('validateBatch', () => {
  it('splits hard and soft violations and ignores ok/empty', () => {
    const { hard, soft } = validateBatch([
      { traitKey: 'canopy_height', raw: -25, label: 'M1' },
      { traitKey: 'canopy_height', raw: 300, label: 'M2' },
      { traitKey: 'canopy_height', raw: 100, label: 'M3' },
      { traitKey: 'canopy_height', raw: '', label: 'M4' }
    ]);
    expect(hard).toHaveLength(1);
    expect(soft).toHaveLength(1);
    expect(hard[0].label).toBe('M1');
    expect(soft[0].label).toBe('M2');
  });
});

describe('custom schema (CONFIG.TRAITS extensibility, Response §6)', () => {
  it('validates against a caller-provided schema (e.g. a new canopy_density trait)', () => {
    const schema = { canopy_density: { min: 0, max: 100, warn_min: 1, warn_max: 60, type: 'float', unit: 'kg/m3' } };
    expect(validateValue('canopy_density', 30, schema)).toMatchObject({ level: 'ok' });
    expect(validateValue('canopy_density', 80, schema)).toMatchObject({ level: 'soft' });
    expect(validateValue('canopy_density', 200, schema)).toMatchObject({ level: 'hard', code: 'out_of_range' });
  });
});

describe('TRAITS schema shape', () => {
  it('every trait has min and a type', () => {
    for (const [key, spec] of Object.entries(TRAITS)) {
      expect(spec, key).toHaveProperty('min');
      expect(['int', 'float']).toContain(spec.type);
    }
  });
});
