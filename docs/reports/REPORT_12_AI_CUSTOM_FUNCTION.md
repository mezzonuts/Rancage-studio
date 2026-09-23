# REPORT 12 — AI Custom Function (Task 12)

## 1. IDENTITAS

| Item | Value |
| :--- | :--- |
| **Task** | Task 12 — `=AI()` Custom Function |
| **Phase** | Phase 3: Spreadsheet Engine |
| **Date** | 2026-09-23 |
| **Status** | ✅ COMPLETE |

## 2. APA YANG DIBANGUN

### Fitur Utama
- **`AIFunction` class** — Memoized AI calls with async queue
- **Cache** — Key: `prompt||sortedRefs`, TTL-based expiry (default 5 min)
- **Async Queue** — Max concurrent requests (default 3)
- **`evaluateAIFormula()`** — Grid context → AI prompt → formula/raw result
- **Formula auto-detect** — If AI returns valid formula, evaluate it against grid

### Files
| File | Change |
| :--- | :--- |
| `src/lib/ai/aifunction.ts` | NEW — AIFunction class + evaluateAIFormula |
| `src/lib/ai/aifunction.test.ts` | NEW — 7 unit tests |

## 3. FITUR SPESIFIK

| Feature | Detail |
| :--- | :--- |
| **Cache key** | `prompt||cellRef1,cellRef2` (sorted) |
| **Cache TTL** | Default 5 min, configurable |
| **Concurrency** | Default 3 parallel AI calls |
| **Formula detection** | Tries parseFormula → evaluate before returning raw |
| **Cleanup** | `clearExpired()` + `clearAll()` |

---

## 4. ALUR LOGIKA

```
Cell: =AI("sum column B where A>100", A1:B10)
  → evaluateAIFormula("sum...", ["A1","B10"], gridCtx, aiFunc)
    → Build context: "A1=5, A10=..."
    → aiFunc.call(prompt, cellRefs)
      → Check cache → hit? return cached
      → Enqueue → processQueue() → execute()
        → client.complete(messages)
        → Cache result
        → Resolve promise
    → sanitizeFormulaResponse(raw)
    → validateFormula(sanitized) → valid?
      → parseFormula → evaluate → return CellValue
      → or return raw string
```

## 5. HASIL PENGUJIAN

| Check | Result |
| :--- | :--- |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors |
| `npm run build` | ✅ 5.8s |
| `npm test` | ✅ 112/112 (7 new aifunction tests) |

## 6. AKTIVE RECALL

1. **Mengapa memoization?** → Same AI request with same data = same result. Cache prevents redundant API calls (cost/speed).
2. **Mengapa async queue with max concurrency?** → Prevents overwhelming AI provider with parallel requests. Most providers have rate limits.
3. **Kenapa auto-detect formula vs raw?** → AI might return `=SUMIFS(...)` or just plain English. Handle both gracefully.

## 7. LANGKAH BERIKUTNYA

- [ ] **Task 13:** AI Formula Generation — NL → formula via Adapter
