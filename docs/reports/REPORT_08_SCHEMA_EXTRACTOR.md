# REPORT 08 — Schema Extractor (Task 8)

## 1. IDENTITAS

| Item | Value |
| :--- | :--- |
| **Task** | Task 8 — Schema Extractor |
| **Phase** | Phase 2: BYOK Manager & AI Adapter |
| **Date** | 2026-09-23 |
| **Status** | ✅ COMPLETE |

## 2. APA YANG DIBANGUN

### Fitur Utama
- **`tableToContext()`** — Convert single TableContext → compact AI prompt text (markdown + CSV sample)
- **`buildAIContext()`** — Multi-table context builder with token-aware truncation
- **`estimateTokens()`** — ~4 chars per token estimator for prompt planning
- **`createTableContext()`** — Factory for TableContext objects

### Files
| File | Change |
| :--- | :--- |
| `src/lib/ai/context.ts` | NEW — tableToContext, buildAIContext, estimateTokens, createTableContext |
| `src/lib/ai/context.test.ts` | NEW — 12 unit tests |
| `src/lib/ai/index.ts` | Updated — barrel exports for context module |

### Output Format
```
You have access to 2 tables in the dataset:

- sales (1000 rows, 4 columns)
- users (500 rows, 2 columns)

## Table: sales (1000 rows)
Columns:
  - id (INTEGER)
  - product (VARCHAR)
  - amount (DOUBLE)
  - sale_date (DATE)

Sample data (3 rows):
id | product | amount | sale_date
1 | "Widget" | 29.99 | "2024-01-15"
2 | "Gadget" | 49.99 | "2024-01-16"
```

## 3. FITUR SPESIFIK

| Feature | Detail |
| :--- | :--- |
| **Multi-table** | Lists all tables, then details per table |
| **Token-aware** | `maxChars` param truncates output to stay within limit |
| **String truncation** | Values > 50 chars get `"xxx..."` |
| **CSV sample** | Header + pipe-separated values — easy for AI to parse |
| **Configurable** | `maxSampleRows` (default: 5), `maxChars` (default: 8000) |

---

## 4. ALUR LOGIKA / ARSITEKTUR

```
DuckDBClient.getSchema() + getSample()
  → createTableContext(name, columns, rowCount, rows)
  → buildAIContext([table1, table2, ...], { maxSampleRows, maxChars })
    → tableToContext(table) per table
    → truncate if exceeds maxChars
    → return compact prompt string
  → pass to AIClient.complete() as system/user message
```

## 5. EDGE CASE & PEMECAHAN MASALAH

| Edge Case | Solusi |
| :--- | :--- |
| **No tables** | Returns empty string |
| **Empty sample rows** | Skips "Sample data" section |
| **Long string values** | Truncated to 50 chars + "..." |
| **Exceeds maxChars** | Partial render + truncation notice |
| **Zero rows** | Shows "(0 rows)" — no crash |

## 6. HASIL PENGUJIAN (QA & Testing)

| Check | Result |
| :--- | :--- |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (1 pre-existing warning) |
| `npm run build` | ✅ compiled successfully, 4.0s |
| `npm test` | ✅ 38/38 pass (12 new context tests) |

### Test Coverage (12 new tests)
| Suite | Tests |
| :--- | :--- |
| tableToContext | 6 — table name, columns, CSV format, maxSampleRows, empty rows, long strings |
| buildAIContext | 4 — empty, single table, multi-table, maxChars truncation |
| estimateTokens | 1 — 4 chars per token |
| createTableContext | 1 — factory |

## 7. AKTIVE RECALL

1. **Mengapa `maxChars` default 8000?** → 8000 chars ≈ 2000 tokens. Cukup untuk schema + 5 rows × beberapa tabel tanpa melebihi context window kebanyakan model.
2. **Kenapa CSV format untuk sample rows?** → AI lebih mudah parse pipe-separated values daripada JSON untuk tabular data. Lebih compact juga.
3. **Kenapa `estimateTokens`?** → Helper untuk konsumen yang perlu predict token usage sebelum call AI. Akurat ±25%.

## 8. LANGKAH BERIKUTNYA (NEXT STEPS)

- [ ] **Task 9:** Prompt Guardrails — system prompt, few-shot examples, AST/regex validator
- [ ] **Task 10:** Spreadsheet Grid — cell editing, virtualized rendering
- [ ] **Task 11:** Formula Engine — parser/evaluator