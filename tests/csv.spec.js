import { describe, it, expect } from 'vitest';
import { toCsv, escapeCsvField, hasBom, BOM } from '../src/csv.js';

describe('CSV export encoding (TODO §4 / Response §3.3)', () => {
  it('prepends a UTF-8 BOM by default', () => {
    const csv = toCsv([{ a: '1' }]);
    expect(hasBom(csv)).toBe(true);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it('preserves Portuguese diacritics', () => {
    const csv = toCsv([{ trait: 'Morfogênese', estado: 'Senescência', obs: 'inflorescência' }]);
    expect(csv).toContain('Morfogênese');
    expect(csv).toContain('Senescência');
    expect(csv).toContain('inflorescência');
  });

  it('uses a semicolon delimiter and key-derived headers', () => {
    const csv = toCsv([{ tratamento: '30', bloco: '1' }]);
    const lines = csv.replace(BOM, '').split('\r\n');
    expect(lines[0]).toBe('tratamento;bloco');
    expect(lines[1]).toBe('30;1');
  });

  it('quotes fields containing the delimiter, quotes or newlines (RFC 4180)', () => {
    expect(escapeCsvField('a;b')).toBe('"a;b"');
    expect(escapeCsvField('he said "hi"')).toBe('"he said ""hi"""');
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
    expect(escapeCsvField('plain')).toBe('plain');
    expect(escapeCsvField(null)).toBe('');
  });

  it('honors explicit headers and can disable the BOM', () => {
    const csv = toCsv([{ a: 1, b: 2 }], ['b', 'a'], { bom: false });
    expect(hasBom(csv)).toBe(false);
    expect(csv.split('\r\n')[0]).toBe('b;a');
    expect(csv.split('\r\n')[1]).toBe('2;1');
  });

  it('handles empty input', () => {
    expect(toCsv([], [], { bom: false })).toBe('');
  });
});
