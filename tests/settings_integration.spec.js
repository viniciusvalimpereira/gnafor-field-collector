import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

// Verifies the Settings overlay (TODO §7): editing the experiment configuration
// at runtime persists to localStorage and re-renders the dependent selects,
// without touching the HTML source.
const here = dirname(fileURLToPath(import.meta.url));
const builtPath = join(here, '..', 'GNAFOR_FieldCollector_v1.1.html');

describe('Settings overlay (built app)', () => {
  it('persists CONFIG changes and re-renders selects', () => {
    expect(existsSync(builtPath)).toBe(true);
    const html = readFileSync(builtPath, 'utf-8');
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/' });
    const { window } = dom;
    const doc = window.document;

    expect(typeof window.openSettings).toBe('function');
    expect(typeof window.saveSettings).toBe('function');

    window.openSettings();
    doc.getElementById('set-trat').value = 'A, B, C';
    doc.getElementById('set-parc').value = 'X, Y';
    doc.getElementById('set-npseudoc').value = '3';
    window.saveSettings();

    const cfg = JSON.parse(window.localStorage.getItem('gnafor-config'));
    expect(cfg.tratamentos).toEqual(['A', 'B', 'C']);
    expect(cfg.parcelas).toEqual(['X', 'Y']);
    expect(cfg.numPseudoc).toBe(3);

    const opts = [...doc.querySelectorAll('#morfo-trat option')].map((o) => o.value).filter(Boolean);
    expect(opts).toEqual(expect.arrayContaining(['A', 'B', 'C']));

    window.close();
  });
});
