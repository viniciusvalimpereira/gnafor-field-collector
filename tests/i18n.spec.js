import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCatalog, t, setLang, getLang, availableLangs, initLang, translateDom
} from '../src/i18n.js';
import pt from '../i18n/strings_pt.json';
import en from '../i18n/strings_en.json';

const CATALOG = { pt, en };

beforeEach(() => {
  loadCatalog(CATALOG);
  setLang('pt');
  try { localStorage.clear(); } catch (_e) { /* ignore */ }
});

describe('catalogue loading and language switching (TODO §6)', () => {
  it('exposes both languages', () => {
    expect(availableLangs().sort()).toEqual(['en', 'pt']);
  });

  it('switches language and persists the choice', () => {
    expect(setLang('en')).toBe(true);
    expect(getLang()).toBe('en');
    expect(localStorage.getItem('gnafor-lang')).toBe('en');
  });

  it('refuses an unsupported language', () => {
    expect(setLang('fr')).toBe(false);
    expect(getLang()).toBe('pt');
  });
});

describe('t() translation', () => {
  it('returns the string in the active language', () => {
    setLang('pt');
    expect(t('common.save')).toBe('Salvar Coleta');
    setLang('en');
    expect(t('common.save')).toBe('Save Entry');
  });

  it('interpolates {params}', () => {
    setLang('en');
    expect(t('setup.welcome', { name: 'Ana' })).toBe('Welcome, Ana!');
    setLang('pt');
    expect(t('prod.fraction_error', { sum: 12.5, sample: 10 }))
      .toBe('Erro: soma do fracionamento (12.5g) é maior que o peso da amostra (10g)!');
  });

  it('falls back to the key when missing', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });
});

describe('initLang resolution', () => {
  it('prefers a persisted choice', () => {
    localStorage.setItem('gnafor-lang', 'en');
    expect(initLang()).toBe('en');
  });

  it('defaults to a supported language when storage is empty', () => {
    localStorage.removeItem('gnafor-lang');
    expect(['pt', 'en']).toContain(initLang());
  });
});

describe('translateDom (jsdom)', () => {
  it('applies text, placeholder and title from data-i18n attributes', () => {
    setLang('en');
    document.body.innerHTML = `
      <h1 data-i18n="app.title"></h1>
      <input data-i18n-placeholder="setup.name_placeholder">
      <button data-i18n-title="header.contrast_title"></button>`;
    translateDom(document);
    expect(document.querySelector('h1').textContent).toBe('GNAFOR Data Collection');
    expect(document.querySelector('input').getAttribute('placeholder')).toBe('e.g. John Smith');
    expect(document.querySelector('button').getAttribute('title')).toBe('High contrast / Sunlight');
  });
});
