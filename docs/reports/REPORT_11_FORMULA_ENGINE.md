# REPORT 11 — Formula Engine (Task 11)

## 1. IDENTITAS

| Item | Value |
| :--- | :--- |
| **Task** | Task 11 — Formula Engine |
| **Phase** | Phase 3: Spreadsheet Engine |
| **Date** | 2026-09-23 |
| **Status** | ✅ COMPLETE |

## 2. APA YANG DIBANGUN

### Fitur Utama
- **Tokenizer** — Lexical analysis for Excel formula syntax
- **Parser** — Recursive descent parser with operator precedence (compare → concat → add → mul → unary → primary)
- **AST** — Typed AST nodes (number, string, boolean, cell, range, binary, unary, func)
- **Evaluator** — Execute AST against grid context, 17 built-in functions
- **Dependency Tracking** — `extractDeps()` extracts cell/range references from AST

### Files
| File | Change |
| :--- | :--- |
| `src/lib/formula/types.ts` | NEW — ASTNode types, EvalContext, DepNode |
| `src/lib/formula/parser.ts` | NEW — Tokenizer + recursive descent parser |
| `src/lib/formula/evaluator.ts` | NEW — Evaluator + 17 built-in functions + extractDeps |
| `src/lib/formula/formula.test.ts` | NEW — 32 unit tests |

### Built-in Functions
SUM, AVERAGE, COUNT, COUNTA, MIN, MAX, IF, SUMIF, COUNTIF, AVERAGEIF, XLOOKUP, ABS, ROUND, LEN, UPPER, LOWER, CONCATENATE

---

## 3. ALUR LOGIKA / ARSITEKTUR

```
Formula string: "=SUMIF(A1:A10,\">100\",B1:B10)"
  → parseFormula()
    → tokenize() → tokens
    → Parser.parse() → AST
  → evaluate(ast, ctx)
    → Walk AST tree
    → Resolve cell refs via ctx.getCell()
    → Expand ranges via expandRange()
    → Call BUILTINS['SUMIF'](args)
    → Return CellValue
```

## 4. EDGE CASE & PEMECAHAN MASALAH

| Edge Case | Solusi |
| :--- | :--- |
| **Division by zero** | Returns '#DIV/0!' string error |
| **Unknown function** | Throws Error |
| **Criteria operators** | Handles `>`, `>=`, `<`, `<=`, `<>`, `=` prefixes |
| **Empty ranges** | Returns 0 for numeric functions |
| **String concatenation** | `&` operator works |

## 5. HASIL PENGUJIAN (QA & Testing)

| Check | Result |
| :--- | :--- |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors |
| `npm run build` | ✅ 5.7s |
| `npm test` | ✅ 105/105 (32 new formula tests) |

### Test Coverage (32 tests)
| Suite | Tests |
| :--- | :--- |
| parseFormula | 5 — number, binary, func, cell, comparison |
| arithmetic | 8 — number, +, precedence, parens, unary, cell, concat, div/0 |
| functions | 10 — SUM, AVERAGE, COUNT, MIN, MAX, IF×2, SUMIF, COUNTIF, XLOOKUP |
| comparison | 6 — >, <, =, <>, >=, <= |
| extractDeps | 3 — cell refs, range, dedup |

## 6. AKTIVE RECALL

1. **Mengapa recursive descent?** → Simple to implement, clear precedence, easy to extend. PEG/ANTLR overkill untuk formula syntax yang relatif flat.
2. **Kenapa `matchCriteria` dengan string prefix?** → Excel pakai `">100"` sebagai criteria string. Kita parse prefix operator dari string.
3. **Mengapa dependency graph di evaluator?** → Untuk recalculation — when cell A changes, re-eval formulas that depend on A. Topological sort ensures correct order.

## 7. LANGKAH BERIKUTNYA

- [ ] **Task 12:** `=AI()` Custom Function — memoization, async queue
- [ ] **Task 13:** AI Formula Generation — NL → formula
