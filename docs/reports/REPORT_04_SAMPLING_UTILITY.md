# LAPORAN IMPLEMENTASI: Task 04 - Sampling Utility

- **Status Build:** PASS
- **TypeScript Check:** PASS (0 errors)
- **ESLint:** PASS (0 errors, 1 pre-existing warning)
- **Unit Tests:** PASS (2/2)
- **Tanggal Selesai:** 2026-09-22
- **Lingkup Fitur:** Phase 1 - Sampling utility: extract 5-10 representative rows + column schema for AI context

---

## 1. RINGKASAN TUGAS (TASK SUMMARY)

- **Tujuan Utama:** Menambahkan utilitas sampling ke `DuckDBClient` dan `schema.ts` untuk mengekstrak 5-10 baris representatif beserta skema kolom, digunakan sebagai konteks AI (LLM prompt).
- **Ruang Lingkup yang Dikerjakan:**
  - Menambahkan method `getSample(tableName, limit?)` di `client.ts` — menggunakan `USING SAMPLE` (BERNOULLI) untuk sampling efisien
  - Menambahkan helper `_toQueryResult()` untuk normalisasi hasil query
  - Menambahkan `getSampleWithSchema()` di `schema.ts` — menggabungkan sample rows + schema kolom + total row count
  - TypeScript interface `SampleClient` untuk type safety
- **Batasan (Out of Scope):**
  - AI context formatting (Task 8 Schema Extractor)
  - Reservoir sampling algorithm (menggunakan built-in DuckDB BERNOULLI)

---

## 2. DAFTAR FILE YANG DIBUAT / DIUBAH

| Path File | Tipe Aksi | Peran & Fungsi |
| :--- | :--- | :--- |
| `rancage-studio/src/lib/duckdb/client.ts` | Modified | Tambah `getSample()` + `_toQueryResult()` — sampling efisien via `USING SAMPLE BERNOULLI` |
| `rancage-studio/src/lib/duckdb/schema.ts` | Modified | Tambah `SampleClient` interface + `getSampleWithSchema()` — sample + schema + rowCount |

---

## 3. BEDAH KODE PER-FILE ("APA, KENAPA, & EDUKASI TEKNIS")

### File: `src/lib/duckdb/client.ts` — Method `getSample()`

#### A. APA (Fungsi & Peran)
- **Fungsi:** Mengembalikan `QueryResult` (columns + rows) berisi sample acak dari tabel.
- **Parameter:** `tableName: string`, `limit = 10`
- **Output:** `{ columns: string[], rows: unknown[][] }`

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **`USING SAMPLE ...% (BERNOULLI)`:** DuckDB native sampling — lebih efisien daripada `ORDER BY random() LIMIT n` untuk tabel besar. Persentase dihitung dari `limit / total_rows * 100`.
- **Fallback small table:** Jika `total_rows <= limit`, query `SELECT *` langsung (tanpa sampling).
- **Private helper `_toQueryResult()`:** DRY — normalisasi `result.schema.fields` + `result.toArray()` ke format `QueryResult` standar.

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

Blok kode penting:

```typescript
async getSample(tableName: string, limit = 10): Promise<QueryResult> {
  await this._ensureReady();
  const count = await this.countRows(tableName);
  if (count === 0) return { columns: [], rows: [] };

  const conn = await this.db!.connect();
  try {
    if (count <= limit) {
      const result = await conn.query(`SELECT * FROM "${tableName}"`);
      return this._toQueryResult(result);
    }
    const result = await conn.query(
      `SELECT * FROM "${tableName}" USING SAMPLE ${Math.round((limit / count) * 100)}% (BERNOULLI) LIMIT ${limit}`
    );
    return this._toQueryResult(result);
  } finally {
    await conn.close();
  }
}
```

- **Pelajaran TypeScript:** `Math.round((limit / count) * 100)` — persentase integer untuk `USING SAMPLE`. `conn.query()` return type di-narrow via helper `_toQueryResult`.
- **Pelajaran DuckDB-Wasm:** `USING SAMPLE n% (BERNOULLI)` — Bernoulli sampling (setiap baris punya probabilitas n% dipilih). Deterministik jika `SET SEED` dipakai.
- **Pelajaran Next.js:** Method ini dipanggil dari Client Component atau Server Action (via `getDuckDBClient()` singleton).
---

### File: `src/lib/duckdb/schema.ts` — `getSampleWithSchema()`

#### A. APA (Fungsi & Peran)
- **Fungsi:** Menggabungkan sample rows + schema kolom + total row count → object siap pakai untuk AI context (Task 8).
- **Parameter:** `client: SampleClient`, `tableName`, `limit = 10`
- **Output:** `{ tableName, rowCount, sampleCount, columns: ColumnSchema[], rows: Record<string, unknown>[] } | null`

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **Interface `SampleClient`:** Abstraksi minimal — hanya butuh `query`, `getSchema`, `getSample`. Memungkinkan testing dengan mock.
- **Konversi `rows: unknown[][]` → `Record<string, unknown>[]`:** Lebih ergonomis untuk AI prompt (akses `row['colName']` vs `row[index]`).

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

Blok kode penting:

```typescript
export interface SampleClient {
  query: (sql: string) => Promise<QueryResult>;
  getSchema: (tableName: string) => Promise<ColumnSchema[]>;
  getSample: (tableName: string, limit?: number) => Promise<QueryResult>;
}

export async function getSampleWithSchema(
  client: SampleClient,
  tableName: string,
  limit = 10
): Promise<{ tableName: string; rowCount: number; sampleCount: number; columns: ColumnSchema[]; rows: Record<string, unknown>[] } | null> {
  const sample = await client.getSample(tableName, limit);
  if (!sample.columns.length) return null;
  const schema = await client.getSchema(tableName);
  const totalRows = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
  const rowCount = Number(totalRows.rows[0]?.[0] ?? 0);

  const sampleRows = sample.rows.map((row: unknown[]) => {
    const obj: Record<string, unknown> = {};
    sample.columns.forEach((colName: string, i: number) => {
      obj[colName] = row[i];
    });
    return obj;
  });

  return { tableName, rowCount, sampleCount: sample.rows.length, columns: schema, rows: sampleRows };
---

## 4. ALGORITMA SAMPLING

1. **Input:** `tableName`, `limit` (default 10)
2. **Count total rows:** `SELECT COUNT(*) FROM "tableName"`
3. **Jika count = 0:** Return empty `{ columns: [], rows: [] }`
4. **Jika count <= limit:** `SELECT * FROM "tableName"` (full table — menghindari sample bias)
5. **Jika count > limit:** `SELECT * FROM "tableName" USING SAMPLE p% (BERNOULLI) LIMIT limit`
   - `p = round((limit / count) * 100)` — persentase target
6. **Return:** Normalized `QueryResult` (columns + rows)

**Kompleksitas:** O(1) untuk sampling (DuckDB native), O(n) untuk full scan jika tabel kecil.

---

## 5. AUDIT ZERO-BUG & PENANGANAN EDGE CASES

| Potensi Masalah / Edge Case | Risiko | Bagaimana Kode Ini Mengatasinya? |
| :--- | :--- | :--- |
| **Tabel kosong (0 rows)** | High | Early return `{ columns: [], rows: [] }` — mencegah division by zero |
| **Tabel kecil (< limit)** | Medium | Full select tanpa sampling — menghindari sample bias |
| **Tabel besar (> 1M rows)** | Low | `USING SAMPLE BERNOULLI` — O(1) memory, tidak full scan |
| **Limit > total rows** | Low | Clamped otomatis via `LIMIT` di SQL |
| **Column names dengan spasi/khusus** | Medium | Quoted identifier `"${tableName}"` — aman |
| **Race condition concurrent sampling** | Low | `_ensureReady()` singleton — satu engine, koneksi sequential |

---

## 6. HASIL PENGUJIAN (TEST RESULTS & QA)

### A. Automated Verification
- **TypeScript Typecheck (`npx tsc --noEmit`):** PASS (0 errors)
- **ESLint Validation (`npm run lint`):** PASS (0 errors, 1 pre-existing warning di `vitest.setup.tsx`)
- **Build (`npm run build`):** PASS (Next.js 16.3.5 Turbopack, compiled 3.6s)
- **Unit Test Execution (`npm run test`):** PASS (2/2 tests)

### B. Manual QA Verification Checklist
- [x] `getSample('table', 5)` → return 5 rows (jika ada)
- [x] `getSample('empty_table')` → return empty columns/rows
- [x] `getSampleWithSchema()` → return combined object dengan `rowCount`, `sampleCount`, `columns`, `rows`
- [x] Type safety: `SampleClient` interface satisfied by `DuckDBClient`

---

## 7. UJI PEMAHAMAN MANDIRI (ACTIVE RECALL)

1. **Pertanyaan:** Mengapa pakai `USING SAMPLE BERNOULLI` bukan `ORDER BY random()`?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   BERNOULLI sampling di DuckDB dijalankan di engine level — hanya memindai subset data, O(1) memory. `ORDER BY random()` butuh full scan + sort O(n log n). Untuk 1M+ rows, BERNOULLI jauh lebih cepat dan hemat memory.</details>

2. **Pertanyaan:** Apa fungsi `_toQueryResult()`?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   Normalisasi hasil `conn.query()` (yang punya `schema.fields` + `toArray()`) ke format `QueryResult` standar `{ columns: string[], rows: unknown[][] }` — dipakai oleh `query()`, `getSample()`, dll. Menghindari duplikasi kode.</details>

3. **Pertanyaan:** Mengapa `getSampleWithSchema` pakai interface `SampleClient` bukan `DuckDBClient` langsung?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   Dependency inversion — fungsi hanya butuh 3 method. Interface memungkinkan mock di unit test (tanpa inisialisasi DuckDB engine), dan decoupling dari implementasi konkret.</details>

---

## 8. LANGKAH SELANJUTNYA (NEXT STEPS)

- **Task Berikutnya:** **Task 5** — BYOK Manager UI: provider selector, config form, localStorage persistence
- **Prasyarat:** Task 4 selesai — sampling utility siap dipakai Task 8 (Schema Extractor → AI context)
- **Pengerjaan:** Implementasi `getSampleWithSchema()` akan dipakai `SchemaExtractor` untuk build prompt context LLM