// CSV serialization with a UTF-8 BOM (TODO §4 / Response §3.3).
//
// The BOM makes Excel and LibreOffice open the file as UTF-8 so Portuguese
// diacritics (ç, ã, ê, ...) render correctly. Fields containing the delimiter,
// quotes or line breaks are quoted and inner quotes are doubled (RFC 4180).

export const BOM = '﻿';
export const DEFAULT_DELIMITER = ';';

/** Quote/escape a single field if it contains the delimiter, quotes or newlines. */
export function escapeCsvField(value, delimiter = DEFAULT_DELIMITER) {
  const s = value === null || value === undefined ? '' : String(value);
  if (s.indexOf('"') !== -1 || s.indexOf(delimiter) !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Serialize an array of row objects to a CSV string.
 * @param {Object[]} rows
 * @param {string[]} [headers] column order; defaults to keys of the first row
 * @param {{delimiter?:string, bom?:boolean}} [opts]
 * @returns {string}
 */
export function toCsv(rows, headers, opts = {}) {
  const delimiter = opts.delimiter || DEFAULT_DELIMITER;
  const bom = opts.bom !== false;
  const cols = headers || (rows.length ? Object.keys(rows[0]) : []);
  const lines = [cols.map((c) => escapeCsvField(c, delimiter)).join(delimiter)];
  for (const row of rows) {
    lines.push(cols.map((c) => escapeCsvField(row[c], delimiter)).join(delimiter));
  }
  return (bom ? BOM : '') + lines.join('\r\n');
}

/** True if the string starts with the UTF-8 BOM. */
export function hasBom(str) {
  return typeof str === 'string' && str.charCodeAt(0) === 0xfeff;
}
