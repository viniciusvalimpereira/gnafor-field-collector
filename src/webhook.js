// Google Sheets webhook payload builder (TODO §8 / Response §5.1).
//
// Single source of truth for the payload schema. The app's flattenForSheets()
// delegates to buildPayload(), and webhook.spec.js locks the column schema so
// v1.1 stays byte-compatible with the ~200 records collected during the field
// pilot (the Apps Script doPost appends rows keyed by these exact names).
//
// Payload shape: { sheet: <tabName>, rows: [ { <column>: <value>, ... } ] }

export function buildPayload(data) {
  if (data.tipo === 'Morfogenese') {
    const rows = [];
    data.pseudocolmos.forEach((ps) => {
      const row = {
        projeto: data.projeto || '', coletor: data.coletor, experimento: data.experimento,
        tratamento: data.tratamento, bloco: data.bloco,
        parcela: data.parcela, data: data.data,
        timestamp: data.timestamp, gps_lat: data.gps_lat || '', gps_lng: data.gps_lng || '',
        pseudocolmo: ps.numero, pseudocolmo_cm: ps.pseudocolmo_cm
      };
      const stats = ps.folhasStatus || [];
      ps.folhas.forEach((f, i) => {
        row['fol_' + (i + 1) + '_cm'] = f;
        row['fol_' + (i + 1) + '_estado'] = stats[i] || '';
      });
      rows.push(row);
    });
    return { sheet: 'Morfogenese', rows };
  } else if (data.tipo === 'Perfilhamento') {
    const rows = data.parcelas.map((p) => ({
      projeto: data.projeto || '', coletor: data.coletor, experimento: data.experimento,
      geracao: data.geracao, data: data.data, cor: data.cor,
      bloco: data.bloco, tratamento: data.tratamento, timestamp: data.timestamp,
      gps_lat: data.gps_lat || '', gps_lng: data.gps_lng || '',
      parcela: p.parcela, basilar: p.basilar, aereo: p.aereo, reprodutivo: p.reprodutivo
    }));
    return { sheet: 'Perfilhamento', rows };
  } else if (data.tipo === 'AlturaDossel') {
    return {
      sheet: 'AlturaDossel',
      rows: [{
        projeto: data.projeto || '', coletor: data.coletor, experimento: data.experimento,
        bloco: data.bloco, tratamento: data.tratamento,
        parcela: data.parcela, data: data.data, timestamp: data.timestamp,
        gps_lat: data.gps_lat || '', gps_lng: data.gps_lng || '',
        medida1_cm: data.medida1, medida2_cm: data.medida2, medida3_cm: data.medida3
      }]
    };
  } else {
    return {
      sheet: 'Producao',
      rows: [{
        projeto: data.projeto || '', coletor: data.coletor, experimento: data.experimento,
        bloco: data.bloco, tratamento: data.tratamento,
        subAmostra: data.subAmostra, data: data.data, timestamp: data.timestamp,
        gps_lat: data.gps_lat || '', gps_lng: data.gps_lng || '',
        producaoTotal: data.producaoTotal, pesoAmostra: data.pesoAmostra,
        laminaFoliar: data.laminaFoliar, colmo: data.colmo,
        materialMorto: data.materialMorto, inflorescencia: data.inflorescencia
      }]
    };
  }
}
