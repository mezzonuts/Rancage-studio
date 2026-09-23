import type { AIMessage } from './types';
import type { TableContext } from './context';
import { tableToContext } from './context';

// ── System Prompt ────────────────────────────────────────────
export const FORMULA_SYSTEM_PROMPT = `You are an Excel formula expert. Given a table schema and user request, generate an Excel-compatible formula.

Rules:
1. Return ONLY the formula — no explanation, no markdown, no backticks.
2. Use Excel function syntax (SUMIFS, XLOOKUP, FILTER, UNIQUE, PIVOTBY, LET, etc.).
3. Column references use the actual column names in angle brackets: <Column Name>.
4. String literals in double quotes: "value".
5. Numbers without quotes: 100, 3.14.
6. If the request is ambiguous, return the most likely interpretation.

Examples:
User: "Sum of amount where product is Widget"
Formula: =SUMIFS(<amount>,<product>,"Widget")

User: "Count of rows where amount > 100"
Formula: =COUNTIF(<amount>,">"&100)

User: "Unique product names"
Formula: =UNIQUE(<product>)

User: "Average amount grouped by product"
Formula: =AVERAGEIF(<product>,"Widget",<amount>)

User: "Lookup amount where id is 5"
Formula: =XLOOKUP(5,<id>,<amount>)
`;

// ── Prompt Builder ───────────────────────────────────────────
/** Build complete message array for formula generation */
export function buildFormulaPrompt(userRequest: string, table: TableContext): AIMessage[] {
  const schemaText = tableToContext(table, 5);

  return [
    { role: 'system', content: FORMULA_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Table schema:\n${schemaText}\n\nUser request: ${userRequest}\n\nFormula:`,
    },
  ];
}

/** Build prompt for natural language analysis */
export function buildAnalysisPrompt(userRequest: string, tables: TableContext[]): AIMessage[] {
  const schemaText = tables.map((t) => tableToContext(t, 3)).join('\n\n');

  return [
    {
      role: 'system',
      content:
        'You are a data analyst. Answer questions about the dataset concisely. Use SQL-like reasoning.',
    },
    {
      role: 'user',
      content: `Dataset:\n${schemaText}\n\nQuestion: ${userRequest}`,
    },
  ];
}
