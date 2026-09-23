// ── Excel Formula Validator ──────────────────────────────────
// Regex-based validator for Excel formula syntax.
// Validates structure, not semantics.

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Known Excel functions (subset commonly used)
const KNOWN_FUNCTIONS = new Set([
  // Math
  'SUM',
  'SUMIF',
  'SUMIFS',
  'AVERAGE',
  'AVERAGEIF',
  'AVERAGEIFS',
  'COUNT',
  'COUNTIF',
  'COUNTIFS',
  'MIN',
  'MAX',
  'ABS',
  'ROUND',
  'POWER',
  'SQRT',
  'MOD',
  'SUMPRODUCT',
  // Lookup
  'VLOOKUP',
  'HLOOKUP',
  'XLOOKUP',
  'INDEX',
  'MATCH',
  'INDIRECT',
  // Text
  'CONCATENATE',
  'LEFT',
  'RIGHT',
  'MID',
  'LEN',
  'TRIM',
  'UPPER',
  'LOWER',
  'PROPER',
  'FIND',
  'SEARCH',
  'SUBSTITUTE',
  'TEXT',
  // Logic
  'IF',
  'IFS',
  'AND',
  'OR',
  'NOT',
  'IFERROR',
  'IFNA',
  'SWITCH',
  // List
  'UNIQUE',
  'FILTER',
  'SORT',
  'SORTBY',
  // Aggregation
  'LET',
  'LAMBDA',
  'MAP',
  'REDUCE',
  'SCAN',
  // Pivot
  'PIVOTBY',
  'GROUPBY',
  // Date
  'TODAY',
  'NOW',
  'YEAR',
  'MONTH',
  'DAY',
  'DATE',
  'DATEVALUE',
  // Other
  'CHOOSEROWS',
  'CHOOSECOLS',
  'TAKE',
  'DROP',
  'TOCOL',
  'TOROW',
]);

/** Validate an Excel formula string */
export function validateFormula(formula: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = formula.trim();

  if (!trimmed) {
    return { valid: false, errors: ['Empty formula'] };
  }

  // Must start with =
  if (!trimmed.startsWith('=')) {
    errors.push('Formula must start with "="');
  }

  const body = trimmed.startsWith('=') ? trimmed.slice(1) : trimmed;

  // Check parentheses balance
  let depth = 0;
  for (const ch of body) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) {
      errors.push('Unmatched closing parenthesis ")"');
      break;
    }
  }
  if (depth > 0) {
    errors.push(`Missing ${depth} closing parenthesis(es)`);
  }

  // Check for known functions
  const funcMatch = body.match(/^([A-Z]+)\s*\(/i);
  if (funcMatch) {
    const funcName = funcMatch[1]!.toUpperCase();
    if (!KNOWN_FUNCTIONS.has(funcName)) {
      errors.push(`Unknown function: ${funcName} — may not be a standard Excel function`);
    }
  }

  // Check for invalid characters (outside strings)
  if (/[^\w\s<>"&,().:+\-*/=%!&|]/i.test(body)) {
    errors.push('Contains unexpected characters');
  }

  return { valid: errors.length === 0, errors };
}

/** Check if a string looks like it contains column references <ColumnName> */
export function hasColumnRefs(formula: string): boolean {
  return /<[A-Za-z0-9_ ]+>/.test(formula);
}

/** Extract column references from a formula */
export function extractColumnRefs(formula: string): string[] {
  const matches = formula.match(/<([A-Za-z0-9_ ]+)>/g);
  return matches ? matches.map((m) => m.slice(1, -1)) : [];
}

/** Sanitize AI response — strip markdown code fences, extra whitespace */
export function sanitizeFormulaResponse(raw: string): string {
  let cleaned = raw.trim();
  // Remove markdown code fences
  cleaned = cleaned.replace(/^```(?:excel|formula)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  // Remove "Formula:" prefix
  cleaned = cleaned.replace(/^Formula:\s*/i, '');
  return cleaned.trim();
}
