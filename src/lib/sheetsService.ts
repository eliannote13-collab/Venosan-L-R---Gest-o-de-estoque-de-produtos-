import { MovementItem, MovementType } from '../types';

export interface SpreadsheetSummary {
  id: string;
  name: string;
  modifiedTime?: string;
}

export interface SheetTab {
  sheetId: number;
  title: string;
}

export interface SpreadsheetDetails {
  id: string;
  title: string;
  sheets: SheetTab[];
}

export const SHEETS_HEADER = [
  'Data NF',
  'Mês Ref',
  'Nº NF',
  'CFOP',
  'SKU',
  'Descrição do Equipamento',
  'Cliente',
  'Modalidade',
  'Quantidade',
  'Qtd Líquida',
  'Cidade',
  'UF',
];

/**
 * Lists Google Sheets files accessible to the user from Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<SpreadsheetSummary[]> {
  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=30`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao listar planilhas do Drive: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    modifiedTime: f.modifiedTime,
  }));
}

/**
 * Fetches spreadsheet metadata (title and sheet tabs)
 */
export async function fetchSpreadsheetDetails(
  accessToken: string | null,
  spreadsheetId: string
): Promise<SpreadsheetDetails> {
  if (accessToken) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties(sheetId,title)`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        const sheets: SheetTab[] = (data.sheets || []).map((s: any) => ({
          sheetId: s.properties.sheetId,
          title: s.properties.title,
        }));

        return {
          id: data.spreadsheetId,
          title: data.properties?.title || 'Planilha Sem Título',
          sheets,
        };
      }
    } catch (e) {
      console.warn('API fetchSpreadsheetDetails failed, using fallback', e);
    }
  }

  // Fallback for public or stored spreadsheet
  return {
    id: spreadsheetId,
    title: 'Planilha Google Sheets',
    sheets: [
      { sheetId: 0, title: 'Fluxo_Saidas' },
      { sheetId: 1, title: 'Página1' },
      { sheetId: 2, title: 'Sheet1' },
    ],
  };
}

/**
 * Parses raw CSV string into 2D array of string values
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === '\t') && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Transforms raw 2D array rows (from Google Sheets API or CSV) into MovementItem[]
 */
export function parseRawRows(rows: any[][]): MovementItem[] {
  if (!rows || rows.length <= 1) {
    return [];
  }

  // Header inspection
  const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase());

  const findCol = (terms: string[]) => {
    return headers.findIndex((h) => terms.some((term) => h.includes(term)));
  };

  const idxData = findCol(['data', 'emissao', 'dia']);
  const idxMes = findCol(['mes', 'mês', 'periodo']);
  const idxNf = findCol(['nf', 'nota', 'número', 'numero']);
  const idxCfop = findCol(['cfop']);
  const idxSku = findCol(['sku', 'código', 'codigo']);
  const idxDesc = findCol(['descri', 'produto', 'equipamento', 'item']);
  const idxCliente = findCol(['cliente', 'destinatario', 'destinatário', 'hospital', 'razão']);
  const idxTipo = findCol(['tipo', 'modalidade', 'operacao', 'operação']);
  const idxQtd = findCol(['qtd', 'quantidade', 'volume']);
  const idxQtdLiq = findCol(['liq', 'líq', 'saldo', 'impacto']);
  const idxCidade = findCol(['cidade', 'municipio']);
  const idxUf = findCol(['uf', 'estado']);

  const parsedItems: MovementItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0 || !r.some((c) => String(c).trim() !== '')) {
      continue;
    }

    const dataNfRaw = idxData >= 0 && r[idxData] ? String(r[idxData]).trim() : String(r[0] || '').trim();
    const nfRaw = idxNf >= 0 && r[idxNf] ? String(r[idxNf]).trim() : String(r[2] || r[1] || '').trim();
    const skuRaw = idxSku >= 0 && r[idxSku] ? String(r[idxSku]).trim() : String(r[4] || '620206').trim();
    const descRaw = idxDesc >= 0 && r[idxDesc] ? String(r[idxDesc]).trim() : String(r[5] || 'Equipamento Hospitalar').trim();
    const clienteRaw = idxCliente >= 0 && r[idxCliente] ? String(r[idxCliente]).trim().toUpperCase() : String(r[6] || 'CLIENTE NÃO IDENTIFICADO').trim().toUpperCase();

    // Determine type
    const tipoRaw = idxTipo >= 0 && r[idxTipo] ? String(r[idxTipo]).trim() : String(r[7] || 'Comodato').trim();
    let normalizedTipo: MovementType = 'Comodato';
    const tLower = tipoRaw.toLowerCase();
    if (tLower.includes('retorno') || tLower.includes('devolu')) {
      normalizedTipo = 'RETORNO';
    } else if (tLower.includes('demonstra')) {
      normalizedTipo = 'Demonstração';
    } else if (tLower.includes('loca')) {
      normalizedTipo = 'Locação';
    } else {
      normalizedTipo = 'Comodato';
    }

    // Determine quantities
    const qtdRaw = idxQtd >= 0 && r[idxQtd] ? Number(String(r[idxQtd]).replace(',', '.')) : Number(r[8] || 1);
    const qtd = isNaN(qtdRaw) || qtdRaw <= 0 ? 1 : Math.abs(qtdRaw);

    let qtdLiq = normalizedTipo === 'RETORNO' ? -qtd : qtd;
    if (idxQtdLiq >= 0 && r[idxQtdLiq] !== undefined && r[idxQtdLiq] !== '') {
      const parsedLiq = Number(String(r[idxQtdLiq]).replace(',', '.'));
      if (!isNaN(parsedLiq)) {
        qtdLiq = parsedLiq;
      }
    }

    // Format and derive month calculation
    let mesCalc = '';
    if (idxMes >= 0 && r[idxMes] && String(r[idxMes]).includes('-')) {
      mesCalc = String(r[idxMes]).trim();
    } else if (dataNfRaw.includes('/')) {
      const parts = dataNfRaw.split('/');
      if (parts.length === 3) {
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        const m = parts[1].padStart(2, '0');
        mesCalc = `${y}-${m}`;
      }
    } else if (dataNfRaw.includes('-')) {
      const parts = dataNfRaw.split('-');
      if (parts[0].length === 4) {
        mesCalc = `${parts[0]}-${parts[1].padStart(2, '0')}`;
      }
    }
    if (!mesCalc) {
      mesCalc = new Date().toISOString().substring(0, 7);
    }

    const cfopRaw = idxCfop >= 0 && r[idxCfop] ? String(r[idxCfop]).trim() : String(r[3] || '6.908').trim();
    const cidadeRaw = idxCidade >= 0 && r[idxCidade] ? String(r[idxCidade]).trim() : undefined;
    const ufRaw = idxUf >= 0 && r[idxUf] ? String(r[idxUf]).trim() : undefined;

    parsedItems.push({
      id: `gsheet-row-${i}-${Date.now()}`,
      data_nf: dataNfRaw || new Date().toLocaleDateString('pt-BR'),
      mes_calc: mesCalc,
      nf: nfRaw || String(300000 + i),
      cfop: cfopRaw,
      sku: skuRaw,
      descricao: descRaw,
      cliente: clienteRaw,
      tipo: normalizedTipo,
      qtd,
      qtd_liquida: qtdLiq,
      cidade: cidadeRaw,
      uf: ufRaw,
    });
  }

  return parsedItems;
}

/**
 * Reads all rows from a given sheet tab and converts them to MovementItem[].
 * Supports authenticated Google Sheets API and public/shared GViz endpoint.
 */
export async function fetchSheetData(
  accessToken: string | null,
  spreadsheetId: string,
  sheetName: string
): Promise<MovementItem[]> {
  // Strategy 1: Authenticated API call if accessToken is provided
  if (accessToken) {
    try {
      const range = encodeURIComponent(`${sheetName}!A1:Z500`);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        const rows: any[][] = data.values || [];
        return parseRawRows(rows);
      }
    } catch (err) {
      console.warn('Google Sheets API call failed, trying CSV endpoint fallback...', err);
    }
  }

  // Strategy 2: Direct Google Sheets GViz CSV export (works for shared/public sheets without login)
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetName
    )}`;
    const res = await fetch(csvUrl);

    if (res.ok) {
      const csvText = await res.text();
      // Ensure it returned actual CSV and not an HTML login error
      if (!csvText.trim().startsWith('<!DOCTYPE') && !csvText.includes('<html')) {
        const rows = parseCsvRows(csvText);
        if (rows.length > 1) {
          return parseRawRows(rows);
        }
      }
    }
  } catch (err) {
    console.warn('GViz CSV export failed:', err);
  }

  throw new Error(
    `Não foi possível carregar os dados da aba '${sheetName}'. Verifique as permissões da planilha ou conecte sua conta Google.`
  );
}

/**
 * Creates a brand new Google Sheet formatted specifically for the VENOSAN dashboard
 */
export async function createNewSpreadsheet(
  accessToken: string,
  title: string,
  seedData: MovementItem[]
): Promise<SpreadsheetDetails> {
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  const rows = [
    SHEETS_HEADER,
    ...seedData.map((d) => [
      d.data_nf,
      d.mes_calc,
      d.nf,
      d.cfop,
      d.sku,
      d.descricao,
      d.cliente,
      d.tipo,
      d.qtd,
      d.qtd_liquida,
      d.cidade || '',
      d.uf || '',
    ]),
  ];

  const body = {
    properties: {
      title: title || 'VENOSAN L&H - Base de Dados Estoque',
    },
    sheets: [
      {
        properties: {
          title: 'Fluxo_Saidas',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: rows.map((row) => ({
              values: row.map((cell) => ({
                userEnteredValue:
                  typeof cell === 'number'
                    ? { numberValue: cell }
                    : { stringValue: String(cell) },
              })),
            })),
          },
        ],
      },
    ],
  };

  const res = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao criar nova planilha no Google Sheets: ${res.status} ${errorText}`);
  }

  const created = await res.json();
  return {
    id: created.spreadsheetId,
    title: created.properties?.title || title,
    sheets: (created.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
    })),
  };
}

/**
 * Appends a new movement row to the connected Google Sheet
 */
export async function appendMovementRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  item: MovementItem
): Promise<void> {
  const range = encodeURIComponent(`${sheetName}!A:L`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const rowValues = [
    item.data_nf,
    item.mes_calc,
    item.nf,
    item.cfop,
    item.sku,
    item.descricao,
    item.cliente,
    item.tipo,
    item.qtd,
    item.qtd_liquida,
    item.cidade || '',
    item.uf || '',
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao adicionar linha no Google Sheets: ${res.status} ${errorText}`);
  }
}
