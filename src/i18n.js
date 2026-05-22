// Runtime internationalization (TODO §6 / Response letter §5.2).
//
// Catalog-agnostic by design so it is testable in isolation:
//   - In the browser, build.py injects `const I18N_STRINGS = {...}` and the
//     app bootstrap calls loadCatalog(I18N_STRINGS).
//   - In Vitest, the spec imports i18n/strings_*.json directly and calls
//     loadCatalog() with them.
//
// The selected language is persisted in localStorage so the choice survives
// across field sessions. t(key) returns the key itself when a string is
// missing, which keeps gaps visible and lets scripts/translate_check.js fail
// loudly on key drift.

const LANG_STORAGE_KEY = 'gnafor-lang';
const DEFAULT_LANG = 'pt';

let _catalog = { pt: {}, en: {} };
let _lang = DEFAULT_LANG;

/** Replace the active catalogue (the {pt, en} object). */
export function loadCatalog(catalog) {
  if (catalog && typeof catalog === 'object') {
    _catalog = catalog;
  }
}

/** Languages the catalogue actually provides. */
export function availableLangs() {
  return Object.keys(_catalog);
}

export function getLang() {
  return _lang;
}

/** Switch language if the catalogue has it; persists the choice. Returns success. */
export function setLang(lang) {
  if (_catalog[lang]) {
    _lang = lang;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      }
    } catch (_e) { /* private mode / storage disabled: keep in-memory only */ }
    return true;
  }
  return false;
}

/**
 * Translate a key. Optional params interpolate {placeholders}.
 * Falls back to the key itself when missing.
 * @param {string} key
 * @param {Object<string, (string|number)>} [params]
 */
export function t(key, params) {
  const table = _catalog[_lang] || {};
  let str = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : key;
  if (params && typeof str === 'string') {
    for (const k of Object.keys(params)) {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), String(params[k]));
    }
  }
  return str;
}

/**
 * Resolve the initial language: persisted choice → browser language → default.
 * Does not throw if storage/navigator are unavailable.
 */
export function initLang() {
  let lang = null;
  try {
    if (typeof localStorage !== 'undefined') {
      lang = localStorage.getItem(LANG_STORAGE_KEY);
    }
  } catch (_e) { /* ignore */ }
  if (!lang || !_catalog[lang]) {
    const nav = (typeof navigator !== 'undefined' && navigator.language) || '';
    lang = nav.toLowerCase().startsWith('pt') ? 'pt' : (_catalog.en ? 'en' : DEFAULT_LANG);
  }
  if (!_catalog[lang]) lang = DEFAULT_LANG;
  _lang = lang;
  return _lang;
}

/**
 * Apply translations to a DOM subtree. Honors:
 *   data-i18n             → element.textContent
 *   data-i18n-html        → element.innerHTML (for strings containing entities)
 *   data-i18n-placeholder → element.placeholder
 *   data-i18n-title       → element.title
 * @param {ParentNode} [root=document]
 */
export function translateDom(root) {
  const scope = root || (typeof document !== 'undefined' ? document : null);
  if (!scope || !scope.querySelectorAll) return;

  scope.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
}
