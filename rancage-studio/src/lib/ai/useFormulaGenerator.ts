import { useCallback, useState } from 'react';
import { FormulaGenerator } from './generation';
import { adapterConfigFromBYOK } from './types';
import { useBYOK } from '@/lib/byok/context';
import type { TableContext } from './context';
import { createTableContext } from './context';
import type { FormulaGenerationResult } from './generation';
import type { ValidationResult } from './validator';

export interface UseFormulaGeneratorReturn {
  generateFormula: (prompt: string, table: TableContext) => Promise<FormulaGenerationResult>;
  isGenerating: boolean;
  error: string | null;
  lastResult: FormulaGenerationResult | null;
  clearError: () => void;
}

/**
 * React hook for generating Excel formulas from natural language prompts.
 * Uses the BYOK configuration to instantiate a FormulaGenerator.
 */
export function useFormulaGenerator(): UseFormulaGeneratorReturn {
  const { config, isLoading } = useBYOK();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<FormulaGenerationResult | null>(null);

  const generateFormula = useCallback(
    async (prompt: string, table: TableContext): Promise<FormulaGenerationResult> => {
      if (isLoading) {
        throw new Error('BYOK configuration is still loading');
      }
      if (!config.baseUrl.trim()) {
        throw new Error('No LLM endpoint configured. Please configure AI in Settings.');
      }

      setIsGenerating(true);
      setError(null);

      try {
        const adapterConfig = adapterConfigFromBYOK(config);
        const generator = new FormulaGenerator(adapterConfig);
        const result = await generator.generateWithValidation(prompt, table);
        setLastResult(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate formula';
        setError(message);
        throw new Error(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [config, isLoading],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { generateFormula, isGenerating, error, lastResult, clearError };
}

/**
 * Build a TableContext from grid data for formula generation.
 * Uses the first row as headers and up to 5 sample data rows.
 */
export function buildTableContextFromGrid(
  data: unknown[][],
  tableName = 'Sheet1',
): TableContext {
  if (data.length === 0) {
    return {
      tableName,
      columns: [],
      rowCount: 0,
      sampleRows: [],
    };
  }

  const headers = data[0]!.map((h, i) => ({
    name: h !== null && h !== undefined ? String(h) : `Column${i + 1}`,
    type: 'TEXT' as const,
  }));

  const sampleRows = data.slice(1, 6).map((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((col, i) => {
      record[col.name] = row[i] ?? null;
    });
    return record;
  });

  return createTableContext(tableName, headers, data.length - 1, sampleRows);
}

/**
 * Extract column names from grid data (first row).
 */
export function extractColumnNames(data: unknown[][]): string[] {
  if (data.length === 0) return [];
  return data[0]!.map((h, i) =>
    h !== null && h !== undefined ? String(h) : `Column${i + 1}`,
  );
}

/**
 * Resolve angle-bracket column references in a formula to actual cell ranges.
 * E.g., "<Revenue>" → "B2:B10" (based on column index in headers).
 * This is a best-effort mapping; formulas with unresolved refs will still be
 * syntactically valid and can be manually edited by the user.
 */
export function resolveColumnRefs(
  formula: string,
  headers: string[],
  dataStartRow = 1, // 0-indexed row where data starts (header is row 0)
): string {
  let resolved = formula;
  headers.forEach((header, colIdx) => {
    const colLetter = String.fromCharCode(65 + colIdx);
    const ref = `<${header}>`;
    // Replace with a range covering the data rows (assume up to 1000 rows)
    const range = `${colLetter}${dataStartRow + 1}:${colLetter}1000`;
    // Use a regex to replace all occurrences
    const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'g');
    resolved = resolved.replace(re, range);
  });
  return resolved;
}

export type { FormulaGenerationResult, ValidationResult };