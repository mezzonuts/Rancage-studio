# REPORT 09 — Prompt Guardrails (Task 9)

## 1. IDENTITAS

| Item | Value |
| :--- | :--- |
| **Task** | Task 9 — Prompt Guardrails |
| **Phase** | Phase 2: BYOK Manager & AI Adapter |
| **Date** | 2026-09-23 |
| **Status** | ✅ COMPLETE |

## 2. APA YANG DIBANGUN

### Fitur Utama
- **`FORMULA_SYSTEM_PROMPT`** — System prompt with rules + 5 few-shot formula examples
- **`buildFormulaPrompt()`** — System + user messages for NL → formula
- **`buildAnalysisPrompt()`** — System + user messages for data analysis
- **`validateFormula()`** — Regex validator: parentheses balance, known functions, syntax
- **`sanitizeFormulaResponse()`** — Strip markdown fences, "Formula:" prefix
- **`extractColumnRefs()` / `hasColumnRefs()`** — Parse `<ColumnName>` references

### Files
| File | Change |
| :--- | :--- |
| `src/lib/ai/prompts.ts` | NEW — FORMULA_SYSTEM_PROMPT, buildFormulaPrompt, buildAnalysisPrompt |
| `src/lib/ai/validator.ts` | NEW — validateFormula, sanitizeFormulaResponse, extractColumnRefs |
| `src/lib/ai/guardrails.test.ts` | NEW — 18 unit tests |
| `src/lib/ai/index.ts` | Updated — barrel exports |

## 3. FITUR SPESIFIK

| Feature | Detail |
| :--- | :--- |
| **Few-shot examples** | SUMIFS, COUNTIF, UNIQUE, AVERAGEIF, XLOOKUP |
| **Known functions** | 60+ Excel functions (math, lookup, text, logic, list, pivot, date) |
| **Validation** | Parens balance, `=` prefix, known function check, char validation |
| **Column refs** | `<Column Name>` pattern — extractable, checkable |
| **Sanitization** | Strip `` ```excel `` fences, `Formula:` prefix, whitespace |

---

## 4. ALUR LOGIKA / ARSITEKTUR

```
User: "Sum amount where product is Widget"
  → buildFormulaPrompt(userRequest, tableContext)
    → system: FORMULA_SYSTEM_PROMPT (few-shot examples)
    → user: schema + request
  → AIClient.complete(messages)
  → raw response: "```excel\n=SUMIFS(<amount>,<product>,\"Widget\")\n```"
  → sanitizeFormulaResponse(raw) → "=SUMIFS(<amount>,<product>,\"Widget\")"
  → validateFormula(formula) → { valid: true, errors: [] }
  → insert into cell
```

## 5. EDGE CASE & PEMECAHAN MASALAH

| Edge Case | Solusi |
| :--- | :--- |
| **AI returns markdown fences** | `sanitizeFormulaResponse()` strips `` ``` `` |
| **AI adds "Formula:" prefix** | `sanitizeFormulaResponse()` strips it |
| **Unbalanced parens** | `validateFormula()` detects extra/missing parens |
| **Unknown function** | Warns (not hard error) — AI might use newer functions |
| **Empty response** | Returns `{ valid: false, errors: ['Empty formula'] }` |
| **No column refs** | `hasColumnRefs()` returns false — can flag for review |

## 6. HASIL PENGUJIAN (QA & Testing)

| Check | Result |
| :--- | :--- |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (1 pre-existing warning) |
| `npm run build` | ✅ compiled successfully, 12.0s |
| `npm test` | ✅ 56/56 pass (18 new guardrails tests) |

### Test Coverage (18 new tests)
| Suite | Tests |
| :--- | :--- |
| validateFormula | 7 — valid, XLOOKUP, empty, no =, unmatched, extra, unknown func |
| hasColumnRefs | 2 — detect, no refs |
| extractColumnRefs | 2 — extract names, empty |
| sanitizeFormulaResponse | 3 — fences, prefix, whitespace |
| buildFormulaPrompt | 3 — structure, schema in user, few-shot examples |
| buildAnalysisPrompt | 1 — multi-table |

## 7. AKTIVE RECALL

1. **Kenapa regex validator instead of AST?** → MVP phase. Regex covers 90% of cases. AST parser needed when supporting nested LET/LAMBDA with arbitrary expressions.
2. **Kenapa "warn" on unknown function?** → AI might use newer Excel 365 functions not in our list. Hard reject would block valid formulas.
3. **Mengapa `<Column Name>` syntax?** → Explicit reference prevents ambiguity. Easy for AI to generate and parser to validate.

## 8. LANGKAH BERIKUTNYA (NEXT STEPS)

- [ ] **Task 10:** Spreadsheet Grid — cell editing, virtualized rendering
- [ ] **Task 11:** Formula Engine — parser/evaluator
- [ ] **Task 12:** `=AI()` Custom Function — memoization, async queue