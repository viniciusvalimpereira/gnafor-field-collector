import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

// Integration smoke test of the BUILT single-file artifact (run `npm run build`
// first). Proves the inlined app boots without throwing and that the language
// selector switches every [data-i18n] string at runtime, with no reload.
const here = dirname(fileURLToPath(import.meta.url));
const builtPath = join(here, '..', 'GNAFOR_FieldCollector_v1.1.html');

describe('built single-file app (TODO §6)', () => {
  it('boots and toggles PT/EN at runtime', () => {
    expect(existsSync(builtPath)).toBe(true);
    const html = readFileSync(builtPath, 'utf-8');
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      url: 'https://localhost/'
    });
    const { window } = dom;

    expect(typeof window.t).toBe('function');
    expect(typeof window.changeLang).toBe('function');

    const h1 = window.document.querySelector('h1[data-i18n="app.title"]');
    const saveBtn = window.document.querySelector('[data-i18n="common.save"]');
    expect(h1).not.toBeNull();
    expect(saveBtn).not.toBeNull();

    window.changeLang('en');
    expect(window.document.documentElement.lang).toBe('en');
    expect(h1.textContent).toBe('GNAFOR Data Collection');
    expect(saveBtn.textContent).toBe('Save Entry');

    // dynamic flow (end-of-day report) also localizes
    window.showEndOfDay();
    expect(window.document.getElementById('endday-content').innerHTML).toContain('Day summary');

    window.changeLang('pt');
    expect(h1.textContent).toBe('Coleta de Dados GNAFOR');
    expect(saveBtn.textContent).toBe('Salvar Coleta');

    window.close();
  });
});
