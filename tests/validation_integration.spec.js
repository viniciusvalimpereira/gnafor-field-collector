import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

// End-to-end check that validation is actually wired into the save flow of the
// BUILT artifact: a biologically impossible canopy height must NOT be persisted;
// a plausible value must persist. (TODO §2 / reviewer's -25 cm example.)
const here = dirname(fileURLToPath(import.meta.url));
const builtPath = join(here, '..', 'GNAFOR_FieldCollector_v1.1.html');

function boot() {
  const html = readFileSync(builtPath, 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/' });
  return dom;
}

describe('validation wired into save flow (built app)', () => {
  it('blocks impossible canopy height, persists a valid one', () => {
    expect(existsSync(builtPath)).toBe(true);
    const dom = boot();
    const { window } = dom;
    const doc = window.document;

    // fill a valid experiment context (values come from CONFIG)
    doc.getElementById('altura-bloco').value = '1';
    doc.getElementById('altura-trat').value = '30';
    doc.getElementById('altura-parcela').value = '1';
    doc.getElementById('altura-data').value = '2026-06-01';
    doc.getElementById('altura-m2').value = '10';
    doc.getElementById('altura-m3').value = '11';
    window.localStorage.removeItem('dunamis-altura');

    // hard violation -> blocked
    doc.getElementById('altura-m1').value = '-25';
    window.saveAltura();
    expect(window.localStorage.getItem('dunamis-altura')).toBeNull();

    // fix to a plausible value -> persists
    doc.getElementById('altura-m1').value = '12';
    window.saveAltura();
    const stored = JSON.parse(window.localStorage.getItem('dunamis-altura') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].medida1).toBe('12');

    window.close();
  });
});
