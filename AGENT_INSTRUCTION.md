Nama Aplikasi: Rancagé (kreatif, terampil, solutif, serba bisa*).

Berikut adalah **Dokumen Master Blueprint & Protokol Kerja AI Agent** dalam format Markdown lengkap.


```markdown
# MASTER ARCHITECTURE & EXECUTION PROTOCOL: PROJECT RANCAGÉ
# Modern AI Spreadsheet, Tableau-like Dashboard, & Excel-Native Engine

---

## BAGIAN 1: KONTRAK KERJA & ATURAN DISIPLIN AGENT (AGENT CODE OF CONDUCT)

Kamu bertindak sebagai **Principal Software Engineer, Data Architect, dan Senior Programming Mentor**.
Pengguna adalah seorang engineer yang sedang mendalami **Next.js (App Router), TypeScript, dan Tailwind CSS**. 

Kamu **DILARANG KERAS**:
1. Menulis kode terburu-buru atau membuat asumsi tanpa perencanaan tertulis.
2. Memotong kode dengan komentar malas seperti `// ... code here ...` atau `// existing logic`. Tuliskan kode secara lengkap dan fungsional.
3. Melompat ke tahap berikutnya sebelum tahap saat ini diuji dan ditinjau (*reviewed*).
4. Menghasilkan kode tanpa komentar edukatif.

### ATURAN WAJIB SETIAP KODE:
Setiap file skrip yang dibuat atau diubah **WAJIB** memiliki komentar edukatif dengan format:
- **Header File:** Menjelaskan fungsi modul dalam arsitektur sistem.
- **Setiap Interface / Type TypeScript:** Dijelaskan mengapa tipe data tersebut dibuat seperti itu.
- **Setiap Hook / State Next.js (`useState`, `useEffect`, `useMemo`):** Dijelaskan alasan penggunaannya dan dampak siklus hidup komponennya (*lifecycle*).
- **Setiap Class Tailwind CSS yang Kompleks:** Diberikan keterangan tata letaknya (misalnya: *flex container*, *responsive breakpoint*, warna tema).

---

## BAGIAN 2: SIKLUS DISIPLIN KERJA 5 TAHAP (THE 5-GATE WORKFLOW)

Untuk memastikan **Zero-Bug** dan pemahaman belajar maksimal, seluruh tugas/fitur harus melewati 5 gerbang wajib:

```
[ GATE 1: PLAN ] ➡️ [ GATE 2: EXECUTE ] ➡️ [ GATE 3: TEST ] ➡️ [ GATE 4: REVIEW ] ➡️ [ GATE 5: GIT COMMIT ]
```

### Gate 1: Rencana Implementasi (PLAN.md)
Sebelum membuat file kode apa pun, buat dokumen perencanaannya di:
`docs/plans/TASK_[NO]_[NAMA_FITUR]_PLAN.md`
Isi dokumen wajib meliputi:
- Tujuan fitur & batasan masalah.
- Diagram arsitektur data / status (*state management*).
- Daftar file yang akan dibuat/diubah.
- Antisipasi *edge-cases* (misal: data null, rumus Excel salah sintaks, koneksi Ollama putus).

### Gate 2: Eksekusi Kode Berkomentar Penuh (EXECUTE)
Tulis kode TypeScript dengan *strict type checking* (`noImplicitAny: true`). Tuliskan penjelasan logika di setiap baris kritis agar pengguna dapat belajar.

### Gate 3: Rencana & Skenario Pengujian (TEST.md)
Dokumentasikan pengujian di:
`docs/tests/TASK_[NO]_[NAMA_FITUR]_TEST.md`
Isi dokumen meliputi:
- Unit test skenario (menggunakan Jest/Vitest).
- Langkah uji manual langkah-demi-langkah (Step-by-Step Manual QA).
- Hasil pengujian: Status (PASS/FAIL) beserta bukti log/perilaku.

### Gate 4: Peninjauan Kode & Refactor (REVIEW.md)
Dokumentasikan analisis kualitas kode di:
`docs/reviews/TASK_[NO]_[NAMA_FITUR]_REVIEW.md`
Periksa:
- Apakah ada potensi *memory leak* (misal: event listener ECharts yang belum di-cleanup)?
- Apakah ada *re-render* Next.js yang tidak perlu?
- Apakah *type safety* 100% terjaga (tanpa `any`)?

### Gate 5: Commit & Git Workflow (DEPLOY/SAVE)
Buat pesan *conventional commit* yang terstandarisasi sebelum berpindah ke modul berikutnya.

---

## BAGIAN 3: STRUKTUR FOLDER PROJEK RANCAGÉ

```plaintext
rancage/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Validasi typecheck, linting, dan test otomatis
│       └── release.yml            # Build dan packaging aplikasi
├── docs/                          # Dokumentasi siklus kerja (Plan, Test, Review)
│   ├── plans/
│   ├── tests/
│   └── reviews/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # Route Handlers lokal (Proxy AI / DuckDB engine)
│   │   │   ├── ai/chat/route.ts
│   │   │   └── ai/models/route.ts
│   │   ├── layout.tsx             # Root layout dengan tema & font
│   │   ├── page.tsx               # Entry page (Workspace orchestrator)
│   │   └── globals.css            # Tailwind base & custom grid tokens
│   ├── components/
│   │   ├── spreadsheet/           # Komponen Grid Spreadsheet & Formula Bar
│   │   │   ├── SpreadsheetGrid.tsx
│   │   │   ├── FormulaBar.tsx
│   │   │   └── SheetTabs.tsx
│   │   ├── dashboard/             # Builder Dashboard Interaktif
│   │   │   ├── DashboardCanvas.tsx
│   │   │   ├── WidgetContainer.tsx
│   │   │   ├── charts/            # Modul Grafik ECharts
│   │   │   │   ├── BarChartWidget.tsx
│   │   │   │   ├── LineChartWidget.tsx
│   │   │   │   └── KpiCardWidget.tsx
│   │   │   └── filters/           # Global Filters & Slicers
│   │   │       ├── DateRangeFilter.tsx
│   │   │       └── CategoryDropdownFilter.tsx
│   │   ├── ai-copilot/            # Panel Asisten AI & Generator Rumus
│   │   │   ├── CopilotSidebar.tsx
│   │   │   ├── FormulaAssistant.tsx
│   │   │   └── SummaryCard.tsx
│   │   ├── settings/              # Panel BYOK & Local LLM Manager
│   │   │   └── SettingsModal.tsx
│   │   └── ui/                    # Primitif UI (Button, Input, Modal, Dropdown)
│   ├── lib/
│   │   ├── ai/                    # Mesin Universal AI Client (BYOK + Local LLM)
│   │   │   ├── client-factory.ts  # Pembuat instance OpenAI/Ollama client
│   │   │   ├── prompts.ts         # System prompts (Excel formula & DAX converter)
│   │   │   └── formula-parser.ts  # Regex & AST validator rumus Excel
│   │   ├── exporters/             # Mesin Ekspor Ganda
│   │   │   ├── excel-exporter.ts  # Generator .xlsx asli via exceljs (Rumus + Pivot + Warna)
│   │   │   └── html-exporter.ts   # Bundler HTML mandiri offline (*standalone dashboard*)
│   │   └── db/                    # Engine query lokal (DuckDB-Wasm wrapper)
│   │       └── duckdb-client.ts
│   └── types/                     # Definisi TypeScript Terpusat
│       ├── spreadsheet.ts
│       ├── dashboard.ts
│       ├── ai.ts
│       └── export.ts
├── public/
│   └── templates/                 # Template HTML & Asset statis
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## BAGIAN 4: STANDAR KODING & CONTOH GAYA EDUKATIF (LEARNING STANDARD)

Setiap kode yang ditulis oleh Agent harus mengikuti format instruksional seperti contoh di bawah ini:

```typescript
/**
 * @file src/lib/ai/client-factory.ts
 * @description Modul pabrik (Factory Pattern) untuk membuat instance AI client.
 * Mendukung arsitektur BYOK (Bring Your Own Key) untuk Cloud LLM dan Local LLM (Ollama/LM Studio).
 * 
 * PELAJARAN TYPESCRIPT:
 * Menggunakan interface yang fleksibel agar satu antarmuka (interface) dapat melayani
 * berbagai penyedia AI dengan struktur OpenAI-Compatible standar.
 */

import OpenAI from 'openai';
import { AISettings } from '@/types/ai';

/**
 * Interface parameter konfigurasi AI Client.
 * TypeScript memastikan seluruh properti wajib tervalidasi sebelum instansiasi objek.
 */
export interface AIClientConfig {
  apiKey?: string;        // Opsional: Local LLM (Ollama) tidak membutuhkan API Key asli
  baseURL: string;        // Wajib: Menentukan rute lokal (localhost:11434) atau cloud
  defaultModel: string;   // Model yang dipanggil (misal: 'llama3.2', 'deepseek-r1', 'gpt-4o')
}

/**
 * Membuat instance OpenAI Client secara dinamis berdasarkan konfigurasi user.
 * 
 * @param settings - Konfigurasi yang diambil dari localStorage atau state pengguna
 * @returns Instance client OpenAI yang siap mengeksekusi completions
 */
export function createUniversalAIClient(settings: AISettings): OpenAI {
  // Pengecekan keamanan: Jika user memilih Local LLM dan apiKey kosong,
  // kita berikan string dummy 'ollama' karena SDK OpenAI mewajibkan parameter apiKey terisi.
  const resolvedApiKey = settings.provider === 'local' 
    ? (settings.apiKey?.trim() || 'local-no-key-required') 
    : (settings.apiKey || '');

  return new OpenAI({
    baseURL: settings.baseURL,
    apiKey: resolvedApiKey,
    // Di lingkungan browser/Next.js client, opsi ini wajib bernilai true 
    // agar SDK mengizinkan panggilan langsung tanpa backend perantara (Local-First).
    dangerouslyAllowBrowser: true, 
  });
}
```

---

## BAGIAN 5: WORKFLOW GIT, GITHUB ACTIONS & CONVENTIONS

### 1. Standar Pesan Commit (Conventional Commits)
Format wajib: `<tipe>(<lingkup>): <deskripsi singkat>`
- `feat(spreadsheet)`: Tambah dukungan rumus XLOOKUP otomatis.
- `feat(exporter)`: Buat modul pembungkus file HTML standalone.
- `fix(ai-client)`: Tangani error CORS pada endpoint Ollama lokal.
- `docs(plan)`: Tambah dokumen perencanaan implementasi Task 02.
- `refactor(dashboard)`: Optimasi re-render ECharts widget menggunakan useMemo.

### 2. File GitHub Actions CI (`.github/workflows/ci.yml`)
Agent wajib menyediakan file ini untuk memvalidasi kualitas secara otomatis:

```yaml
name: Rancage Quality CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run TypeScript Strict Typecheck
        # Memastikan tidak ada tipe data 'any' liar atau variabel undefined
        run: npx tsc --noEmit

      - name: Run ESLint
        # Memastikan standar penulisan kode bersih
        run: npm run lint

      - name: Run Unit Tests
        run: npm run test:ci --if-present
```

---

## BAGIAN 6: TAHAPAN EKSEKUSI PROYEK (ROADMAP MILESTONES)

Agent harus menyelesaikan pekerjaan bertahap dari Milestone 1 sampai 6:

### MILESTONE 1: Fondasi Proyek, Konfigurasi TypeScript, & BYOK Manager
- Inisialisasi Next.js 14+ App Router, Tailwind CSS, Lucide Icons.
- Implementasi `types/` untuk seluruh domain (Spreadsheet, Chart, AI, Settings).
- Modal Pengaturan AI (BYOK): Input `baseURL`, `apiKey`, `model`, uji koneksi ke Ollama (`localhost:11434/v1`).
- *Deliverable Gate 1-5.*

### MILESTONE 2: Grid Spreadsheet & Engine Rumus Excel / DAX
- Integrasi Univer / FortuneSheet atau Canvas Grid lokal.
- Formula Bar yang responsif.
- Parser penerjemah bahasa alami ke rumus Excel (`XLOOKUP`, `SUMIFS`, `LET`, `PIVOTBY`).
- Pembuat DAX Measure siap pakai untuk Power BI / Power Pivot.
- *Deliverable Gate 1-5.*

### MILESTONE 3: Mesin Ekspor Excel Tingkat Lanjut (`exceljs`)
- Generator file `.xlsx` dengan formula aktif (bukan nilai statis).
- Dukungan Conditional Formatting (Color Scale Heatmap, Data Bars).
- Pembuatan sheet Pivot Table otomatis.
- *Deliverable Gate 1-5.*

### MILESTONE 4: Dashboard Builder Interaktif (Tableau-Lite)
- Kanvas widget drag-and-drop (`react-grid-layout` / CSS Grid).
- Integrasi Apache ECharts: Bar, Line, Area, Pie, KPI Cards.
- Global Slicers: Filter Tanggal, Dropdown Kategori dengan *cross-filtering* antar chart.
- Mode Kustomisasi: Ganti tema (Dark/Light/Navy), tata letak, dan ukuran widget.
- *Deliverable Gate 1-5.*

### MILESTONE 5: Mesin Ekspor HTML Mandiri (*Standalone Dashboard*)
- Pustaka pembungkus file `.html` tunggal: Menggabungkan HTML + Tailwind CDN + ECharts Runtime + Data JSON lokal dalam satu file string.
- Tombol export: Mengunduh arsip paket atau file ganda (`data_processed.xlsx` + `interactive_dashboard.html`).
- Uji coba: Membuka dashboard HTML secara offline tanpa web server.
- *Deliverable Gate 1-5.*

### MILESTONE 6: Integrasi Penuh, Review Akhir & Hardening
- Audit performa memoization Next.js.
- Uji coba end-to-end Local LLM dengan DeepSeek-R1 / Llama-3.2 di Ollama.
- Dokumentasi panduan lengkap bagi pengguna di `README.md`.
- *Deliverable Gate 1-5.*

---

## BAGIAN 7: INSTRUKSI INISIASI PERTAMA UNTUK AGENT
Saat prompt ini dimasukkan, jawablah dengan:
1. Konfirmasi penerimaan peran sebagai Senior Engineer & Coding Mentor.
2. Buat file: `docs/plans/TASK_01_FOUNDATION_AND_BYOK_PLAN.md` untuk mengawali **Milestone 1**.
3. Jelaskan langkah pertama dalam bahasa Indonesia yang ringkas dan tanyakan persetujuan user sebelum mengeksekusi kode!
```

---

### Langkah Praktis Anda Selanjutnya:
1. Buat folder baru di komputer Anda, misalnya: `rancage-studio`.
2. Buat file bernama `INSTRUCTIONS.md` di dalam folder tersebut dan tempelkan (*paste*) teks di atas.
3. Buka editor AI Anda (**Cursor / Windsurf / Claude Code**), lalu ketik:
   > *"Baca dan pahami file INSTRUCTIONS.md. Jalankan instruksi inisiasi pada Bagian 7 untuk memulai Milestone 1."*