import ExcelJS from 'exceljs';

export interface ExcelExportData {
  sheetName: string;
  headers: string[];
  rows: unknown[][];
  formulas?: { row: number; col: number; formula: string }[];
  conditionalFormatting?: CFRule[];
}

export interface CFRule {
  type: 'cellIs' | 'colorScale';
  range: string;
  operator?: 'greaterThan' | 'lessThan' | 'between';
  value?: number;
  value2?: number;
  color?: string;
  color2?: string;
}

export async function exportToExcel(
  data: ExcelExportData,
  filename = 'export.xlsx'
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(data.sheetName);

  // Headers
  const headerRow = ws.addRow(data.headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  });

  // Data rows
  data.rows.forEach((row, rowIdx) => {
    const r = ws.addRow(row);
    r.eachCell((cell, colNum) => {
      // Check for formula
      const f = data.formulas?.find((fm) => fm.row === rowIdx && fm.col === colNum - 1);
      if (f) cell.value = { formula: f.formula };
      // Number format
      if (typeof cell.value === 'number') cell.numFmt = '#,##0.##';
    });
  });

  // Auto-width
  for (const col of ws.columns) {
    if (!col || !col.eachCell) continue;
    let maxLen = 10;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? '').length;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 2, 50);
  }

  // Conditional formatting (best-effort — skip if API incompatible)
  try {
    if (data.conditionalFormatting) {
      for (const cr of data.conditionalFormatting) {
        if (cr.type === 'cellIs' && cr.operator && cr.color) {
          (
            ws as unknown as { addConditionalFormatting(opts: unknown): void }
          ).addConditionalFormatting({
            range: cr.range,
            rules: [
              {
                type: 'cellIs',
                operator: cr.operator,
                priority: 1,
                formulae: [String(cr.value ?? 0)],
                style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: cr.color } } },
              },
            ],
          });
        }
      }
    }
  } catch {
    // CF export is optional
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
