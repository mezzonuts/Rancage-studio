import { describe, it, expect } from 'vitest';
import {
  validateFormula,
  hasColumnRefs,
  extractColumnRefs,
  sanitizeFormulaResponse,
} from './validator';
import { buildFormulaPrompt, buildAnalysisPrompt, FORMULA_SYSTEM_PROMPT } from './prompts';
import type { TableContext } from './context';

const table: TableContext = {
  tableName: 'sales',
  columns: [
    { name: 'id', type: 'INTEGER' },
    { name: 'product', type: 'VARCHAR' },
    { name: 'amount', type: 'DOUBLE' },
  ],
  rowCount: 100,
  sampleRows: [],
};

describe('validateFormula', () => {
  it('accepts valid SUMIFS formula', () => {
    const result = validateFormula('=SUMIFS(<amount>,<product>,"Widget")');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts valid XLOOKUP formula', () => {
    const result = validateFormula('=XLOOKUP(5,<id>,<amount>)');
    expect(result.valid).toBe(true);
  });

  it('rejects empty formula', () => {
    const result = validateFormula('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Empty');
  });

  it('rejects formula without =', () => {
    const result = validateFormula('SUM(A1:A10)');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('='))).toBe(true);
  });

  it('detects unmatched parentheses', () => {
    const result = validateFormula('=SUMIFS(<amount>,<product>');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing'))).toBe(true);
  });

  it('detects extra closing parentheses', () => {
    const result = validateFormula('=SUM(<amount>))');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unmatched'))).toBe(true);
  });

  it('warns on unknown function', () => {
    const result = validateFormula('=FAKEFUNC(<amount>)');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unknown'))).toBe(true);
  });
});

describe('hasColumnRefs', () => {
  it('detects column references', () => {
    expect(hasColumnRefs('=SUMIFS(<amount>,<product>,"Widget")')).toBe(true);
  });

  it('returns false for no references', () => {
    expect(hasColumnRefs('=SUM(1,2,3)')).toBe(false);
  });
});

describe('extractColumnRefs', () => {
  it('extracts column names', () => {
    const refs = extractColumnRefs('=SUMIFS(<amount>,<product>,"Widget")');
    expect(refs).toEqual(['amount', 'product']);
  });

  it('returns empty for no refs', () => {
    expect(extractColumnRefs('=SUM(1,2)')).toEqual([]);
  });
});

describe('sanitizeFormulaResponse', () => {
  it('removes code fences', () => {
    expect(sanitizeFormulaResponse('```excel\n=SUM(A1:A10)\n```')).toBe('=SUM(A1:A10)');
  });

  it('removes Formula: prefix', () => {
    expect(sanitizeFormulaResponse('Formula: =SUM(A1:A10)')).toBe('=SUM(A1:A10)');
  });

  it('trims whitespace', () => {
    expect(sanitizeFormulaResponse('  =SUM(A1:A10)  ')).toBe('=SUM(A1:A10)');
  });
});

describe('buildFormulaPrompt', () => {
  it('returns system + user messages', () => {
    const msgs = buildFormulaPrompt('Sum of amount', table);
    expect(msgs).toHaveLength(2);
    expect(msgs[0]!.role).toBe('system');
    expect(msgs[1]!.role).toBe('user');
  });

  it('includes table schema in user message', () => {
    const msgs = buildFormulaPrompt('Sum of amount', table);
    expect(msgs[1]!.content).toContain('sales');
    expect(msgs[1]!.content).toContain('amount');
  });

  it('system prompt contains few-shot examples', () => {
    expect(FORMULA_SYSTEM_PROMPT).toContain('SUMIFS');
    expect(FORMULA_SYSTEM_PROMPT).toContain('XLOOKUP');
  });
});

describe('buildAnalysisPrompt', () => {
  it('includes multiple tables', () => {
    const msgs = buildAnalysisPrompt('Top products', [table]);
    expect(msgs).toHaveLength(2);
    expect(msgs[1]!.content).toContain('sales');
  });
});
