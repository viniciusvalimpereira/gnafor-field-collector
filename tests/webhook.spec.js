import { describe, it, expect } from 'vitest';
import { buildPayload } from '../src/webhook.js';

const base = {
  projeto: 'Projeto Dunamis', coletor: 'Ana', experimento: 'Exp',
  bloco: '1', tratamento: '30', data: '2026-04-01',
  timestamp: '2026-04-01T12:00:00.000Z', gps_lat: -20.1, gps_lng: -44.9
};

describe('buildPayload — schema lock (TODO §8; pilot compatibility)', () => {
  it('Morfogenese: one row per pseudostem, fol_N_cm/_estado columns', () => {
    const p = buildPayload({
      ...base, tipo: 'Morfogenese', parcela: '1',
      pseudocolmos: [
        { numero: 1, pseudocolmo_cm: 3.2, folhas: [10, 12], folhasStatus: ['E', 'EE'] },
        { numero: 2, pseudocolmo_cm: 2.8, folhas: [9, 11], folhasStatus: ['E', 'S'] }
      ]
    });
    expect(p.sheet).toBe('Morfogenese');
    expect(p.rows).toHaveLength(2);
    expect(Object.keys(p.rows[0]).sort()).toEqual([
      'projeto', 'coletor', 'experimento', 'tratamento', 'bloco', 'parcela', 'data',
      'timestamp', 'gps_lat', 'gps_lng', 'pseudocolmo', 'pseudocolmo_cm',
      'fol_1_cm', 'fol_1_estado', 'fol_2_cm', 'fol_2_estado'
    ].sort());
    expect(p.rows[0].fol_1_cm).toBe(10);
    expect(p.rows[0].fol_2_estado).toBe('EE');
  });

  it('Perfilhamento: one row per plot with tiller counts', () => {
    const p = buildPayload({
      ...base, tipo: 'Perfilhamento', geracao: '1a Geracao', cor: 'Azul',
      parcelas: [{ parcela: '1', basilar: 5, aereo: 2, reprodutivo: 1 }]
    });
    expect(p.sheet).toBe('Perfilhamento');
    expect(Object.keys(p.rows[0]).sort()).toEqual([
      'projeto', 'coletor', 'experimento', 'geracao', 'data', 'cor', 'bloco',
      'tratamento', 'timestamp', 'gps_lat', 'gps_lng', 'parcela', 'basilar', 'aereo', 'reprodutivo'
    ].sort());
  });

  it('AlturaDossel: single row with three height columns', () => {
    const p = buildPayload({ ...base, tipo: 'AlturaDossel', parcela: '1', medida1: 12, medida2: 14, medida3: 13 });
    expect(p.sheet).toBe('AlturaDossel');
    expect(p.rows).toHaveLength(1);
    expect(Object.keys(p.rows[0]).sort()).toEqual([
      'projeto', 'coletor', 'experimento', 'bloco', 'tratamento', 'parcela', 'data',
      'timestamp', 'gps_lat', 'gps_lng', 'medida1_cm', 'medida2_cm', 'medida3_cm'
    ].sort());
  });

  it('Producao: single row with fractionation columns', () => {
    const p = buildPayload({
      ...base, tipo: 'Producao', subAmostra: '1', producaoTotal: '2.5', pesoAmostra: '300',
      laminaFoliar: '120', colmo: '90', materialMorto: '60', inflorescencia: '30'
    });
    expect(p.sheet).toBe('Producao');
    expect(Object.keys(p.rows[0]).sort()).toEqual([
      'projeto', 'coletor', 'experimento', 'bloco', 'tratamento', 'subAmostra', 'data',
      'timestamp', 'gps_lat', 'gps_lng', 'producaoTotal', 'pesoAmostra', 'laminaFoliar',
      'colmo', 'materialMorto', 'inflorescencia'
    ].sort());
  });
});
