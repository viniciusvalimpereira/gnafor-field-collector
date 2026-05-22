#!/usr/bin/env node
/**
 * translate_check.js (Response letter §5.2)
 *
 * Guards the bilingual contract: i18n/strings_pt.json and strings_en.json must
 * expose exactly the same set of keys. Run by `npm run i18n:check` and in CI.
 * Exits non-zero (failing the build) if any key exists in one catalogue but
 * not the other, so PT/EN can never silently drift out of sync.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const i18nDir = join(here, '..', 'i18n');

function loadKeys(file) {
  const obj = JSON.parse(readFileSync(join(i18nDir, file), 'utf-8'));
  return new Set(Object.keys(obj));
}

const pt = loadKeys('strings_pt.json');
const en = loadKeys('strings_en.json');

const missingInEn = [...pt].filter((k) => !en.has(k));
const missingInPt = [...en].filter((k) => !pt.has(k));

if (missingInEn.length === 0 && missingInPt.length === 0) {
  console.log(`i18n:check OK — ${pt.size} keys, PT and EN in sync.`);
  process.exit(0);
}

if (missingInEn.length) {
  console.error(`Missing in strings_en.json (${missingInEn.length}):`);
  missingInEn.forEach((k) => console.error(`  - ${k}`));
}
if (missingInPt.length) {
  console.error(`Missing in strings_pt.json (${missingInPt.length}):`);
  missingInPt.forEach((k) => console.error(`  - ${k}`));
}
process.exit(1);
