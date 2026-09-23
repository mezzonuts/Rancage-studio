Berikut adalah dokumen **Product Requirements Document (PRD) & Technical Specification** resmi untuk **Project Rancagé** dalam format Markdown lengkap yang siap dimasukkan ke dalam repositori dokumentasi Anda (`docs/PRD.md`):

---

```markdown
# PRODUCT REQUIREMENTS DOCUMENT (PRD) & TECHNICAL SPECIFICATION
## Proyek: Rancagé Studio (Local-First AI Spreadsheet & Dashboard Engine)

---

### 1. PROBLEM STATEMENT (Masalah yang Diselesaikan)
1. **Dilema Alat Analisis:** Pengguna bisnis dan analis data terjebak di antara dua kutub:
   - *Spreadsheet Tradisional (Excel/Google Sheets):* Fleksibel dan familiar, namun visualisasi dashboard-nya kaku, lambat saat data membesar, dan sulit dibagikan secara interaktif ke pihak luar tanpa risiko rumus rusak.
   - *Platform Enterprise BI (Tableau/Power BI):* Visualisasi sangat kuat, namun lisensinya mahal, kurva belajarnya curam, dan kaku untuk manipulasi seluler cepat ala spreadsheet.
2. **Ketergantungan Cloud & Privasi Data Terancam:** Solusi modern berbasis AI seperti *Rows.com* atau *Julius AI* mewajibkan pengunggahan data sensitif perusahaan ke cloud pihak ketiga, menimbulkan risiko kepatuhan hukum (*data privacy/compliance*) dan biaya langganan berulang (*token billing*).
3. **Kutukan "Nilai Mati" (Vendor Lock-in AI):** Kebanyakan alat AI analitik saat ini mengeksekusi transformasi data di backend mereka dan hanya mengembalikan angka statis (*hardcoded values*). Ketika diekspor kembali ke Excel, rumus relasional, logika perhitungan, dan *conditional formatting* hilang sepenuhnya.
4. **Distribusi Dashboard yang Rumit:** Berbagi dashboard interaktif biasanya membutuhkan akses server, akun berbayar, atau file berukuran besar yang sulit dibuka oleh penerima biasa.

---

### 2. GOALS & NON-GOALS (Ruang Lingkup Proyek)

#### A. Goals (Dalam Lingkup)
- **Local-First & Privasi Mutlak (BYOK):** Aplikasi berjalan penuh di sisi klien (*client-side*). Pengguna bebas memasukkan API Key sendiri (*Bring Your Own Key*) atau menghubungkannya ke Local LLM gratis (Ollama / LM Studio) tanpa ada data yang bocor ke internet.
- **Excel-Native Preservation:** Setiap hasil kalkulasi atau manipulasi AI harus dikonversi kembali ke sintaks rumus Excel asli (`XLOOKUP`, `SUMIFS`, `LET`, `PIVOTBY`) atau ekspresi Power DAX, lengkap dengan *Conditional Formatting* dinamis.
- **Ekspor Ganda Mandiri (*Dual Standalone Export*):** Menghasilkan paket data berisi:
  1. File `.xlsx` hidup (berisi formula asli dan format sel).
  2. File `dashboard.html` mandiri (dapat dibuka secara *offline* di browser mana pun dengan visualisasi interaktif penuh tanpa perlu web server).
- **Dashboard Studio Modular:** Antarmuka visual drag-and-drop dengan komponen *Global Slicers* (filter tanggal/kategori), *KPI Metric Cards*, dan *Apache ECharts* yang mendukung *cross-filtering*.

#### B. Non-Goals (Di Luar Lingkup v1)
- **Bukan Sistem Multi-Tenant Cloud:** Tidak menyediakan sistem login akun, autentikasi cloud, database server terpusat, atau pembayaran kartu kredit.
- **Bukan Real-time Multi-User Collaboration:** Tidak mendukung kolaborasi edit bersamaan multi-kursor seperti Google Docs/Figma pada iterasi awal.
- **Bukan Pengganti Big Data Warehouse:** Tidak dirancang untuk memproses puluhan juta baris data (*Tera/Petabytes*); batas optimal browser adalah hingga 100.000–500.000 baris menggunakan DuckDB-Wasm.

---

### 3. USER STORIES (Pengguna & Nilai Tambah)

| Persona | Kebutuhan (*Action*) | Nilai Manfaat (*Benefit*) |
| :--- | :--- | :--- |
| **Financial / Business Analyst** | Menghitung proyeksi pendapatan menggunakan perintah bahasa alami. | AI langsung menyisipkan rumus Excel asli (`=SUMIFS(...)`) dan aturan *color scale*, sehingga saat dikirim ke atasan via `.xlsx`, semua rumus tetap hidup dan dapat diaudit. |
| **Freelance Data Consultant** | Menyerahkan laporan dashboard interaktif kepada klien tanpa lisensi software. | Cukup mengirimkan satu file `dashboard.html` mandiri. Klien dapat membuka grafik interaktif dan memfilter data secara offline di laptop mereka. |
| **Data Privacy Officer / Corporate** | Menganalisis data penggajian (*payroll*) dan laba bersih internal dengan bantuan AI. | Mengarahkan endpoint AI ke Ollama lokal (`localhost:11434`). Data rahasia 100% diproses di RAM komputer tanpa melewati koneksi internet. |

---

### 4. FUNCTIONAL REQUIREMENTS (Spesifikasi Fungsional)

#### FR-1: Sistem AI & BYOK Manager
- **FR-1.1:** Pengguna dapat beralih antara provider: *Local LLM (Ollama, LM Studio)*, *OpenAI*, *Anthropic*, atau *OpenRouter*.
- **FR-1.2:** Pengguna dapat mengonfigurasi `Base URL`, `API Key`, `Model Name`, dan `Max Tokens`.
- **FR-1.3:** Tersedia tombol *"Test Connection"* yang mengirimkan ping payload ringan untuk memverifikasi kesiapan endpoint sebelum dipakai.
- **FR-1.4:** Seluruh konfigurasi sensitif disimpan eksklusif pada `localStorage` browser pengguna.

#### FR-2: Mesin Spreadsheet & AI Formula Converter
- **FR-2.1:** Komponen grid mendukung manipulasi sel standar, pengisian otomatis (*drag-to-fill*), seleksi rentang (*range selection*), dan penambahan/penghapusan kolom/baris.
- **FR-2.2:** AI Copilot mampu menerjemahkan perintah teks bebas menjadi:
  - Rumus tunggal Excel (misal: `=IF(D2>1000, "Bonus", "Standard")`).
  - Rumus array dinamis modern (`XLOOKUP`, `UNIQUE`, `FILTER`, `PIVOTBY`).
  - Ekspresi Power DAX (untuk kebutuhan model tabular Power BI/Excel Data Model).
- **FR-2.3:** Tersedia rumus khusus `=AI("prompt", referensi_sel)` dengan sistem *memoization/caching* lokal untuk mencegah pemanggilan berulang yang sia-sia.

#### FR-3: Builder Dashboard Visual (Tableau-Lite)
- **FR-3.1:** Kanvas berbasis grid modular yang mendukung penataan ukuran dan posisi widget secara responsif.
- **FR-3.2:** Widget grafik interaktif berbasis Apache ECharts: Bar (Stacked/Grouped), Line, Area, Pie/Donut, Scatter, dan Radar.
- **FR-3.3:** Widget KPI Metric Card yang menampilkan angka utama, persentase pertumbuhan, dan indikator tren status.
- **FR-3.4:** Global Slicers/Filters: Pemilih rentang tanggal (*Date Range Picker*) dan dropdown multi-seleksi kategori yang secara instan menyaring data di seluruh widget kanvas (*cross-filtering*).

#### FR-4: Mesin Ekspor Ganda (Dual Exporter)
- **FR-4.1: Ekspor Excel (`.xlsx`):** Menggunakan pustaka `exceljs` untuk menghasilkan file yang mempertahankan formula asli, definisi Pivot, tipe data angka/tanggal, dan aturan *Conditional Formatting* (misal: heatmap hijau-kuning-merah).
- **FR-4.2: Ekspor HTML Standalone (`.html`):** Mengompilasi seluruh visualisasi dashboard, pustaka ECharts minified, dan dataset lokal ke dalam satu file HTML mandiri yang dapat dijalankan secara offline via protokol `file:///`.

---

### 5. NON-FUNCTIONAL REQUIREMENTS (Keandalan & Standar Teknis)

- **NFR-1 (Performa Klien):**
  - Render awal antarmuka workspace < 1.5 detik.
  - Latensi interaksi filter/slicer pada dataset 50.000 baris < 150 milidetik (memanfaatkan komputasi in-memory DuckDB-Wasm).
- **NFR-2 (Privasi & Keamanan):**
  - Zero External Telemetry: Tidak ada skrip analitik eksternal (Google Analytics, Mixpanel) yang melacak isi data pengguna.
  - Saat mode Local LLM aktif, *Content Security Policy (CSP)* dapat memblokir seluruh lalu lintas jaringan keluar kecuali ke `http://localhost:*` atau `http://127.0.0.1:*`.
- **NFR-3 (Kualitas Kode & Type Safety):**
  - 100% ditulis dalam TypeScript dengan aturan `strict: true`. Bebas dari tipe data liar `any`.
  - Struktur komponen modular terpisah antara *presentation logic* dan *business calculation*.
- **NFR-4 (Portabilitas Standalone):**
  - File HTML yang diekspor tidak boleh bergantung pada koneksi internet publik untuk merender grafik dan filter. Seluruh asset kritis harus *inlined* atau memanfaatkan data URI.

---

### 6. ACCEPTANCE CRITERIA (Kriteria Kelulusan Pengujian)

| ID | Fitur | Skenario Pengujian | Hasil yang Diharapkan (PASS) |
| :--- | :--- | :--- | :--- |
| **AC-01** | Koneksi Local LLM | Masukkan endpoint Ollama `http://localhost:11434/v1` dan klik "Test Connection". | Indikator status berubah hijau (Connected) dan daftar model lokal (misal: `llama3.2`) otomatis terdeteksi. |
| **AC-02** | Integritas Rumus Excel | Minta AI membuat rumus pencarian diskon, lalu unduh file `.xlsx`. Buka file di Microsoft Excel desktop. | Sel target menampilkan rumus asli `=XLOOKUP(...)` (bukan nilai statis). Mengubah nilai input otomatis menghitung ulang hasil. |
| **AC-03** | Conditional Formatting | Buat aturan sel: "Nilai di atas 80 berwarna hijau, di bawah 50 merah". Ekspor ke Excel. | Microsoft Excel menampilkan styling warna asli di bawah menu Conditional Formatting Rules Manager. |
| **AC-04** | Dashboard Offline | Bangun dashboard dengan 1 KPI card dan 2 Chart, lalu klik "Export Standalone HTML". Matikan Wi-Fi komputer dan buka file `.html` hasil unduhan di browser. | Dashboard terbuka sempurna, grafik ECharts terender, dan slicer dropdown tetap dapat memfilter data secara offline. |
| **AC-05** | Optimasi Token AI | Muat file data sebesar 20.000 baris, lalu minta AI membuat ringkasan tren. | Payload yang dikirim ke LLM hanya berupa skema kolom + 5 baris data sampel; tidak terjadi error *context window limit*. |

---

### 7. ARCHITECTURE & DESIGN DECISIONS (Keputusan Arsitektur Kunci)

```plaintext
[ User Input / Excel Import ]
             │
             ▼
   [ DuckDB-Wasm Engine ] ◄── (Kueri SQL & Agregasi Cepat Sisi Klien)
        │          │
        │          ├──────────────────────────────┐
        ▼          ▼                              ▼
[ Grid Spreadsheet ]    [ Canvas Dashboard ]    [ AI Schema Extractor ]
(Rumus & Formatting)     (ECharts & Slicers)    (Sampling 5-10 baris saja)
        │                         │                       │
        │ (exceljs)               │ (Single-file bundler) ▼
        ▼                         ▼             [ Local / Cloud LLM ]
[ File: data.xlsx ]     [ File: dashboard.html ] (BYOK: Ollama/OpenAI)
(Rumus Asli & Pivot)     (Interaktif & Offline)           │
                                                          ▼
                                                [ Formula / DAX Output ]
```

1. **Next.js (App Router) + Tailwind CSS:** Dipilih karena efisiensi rendering antarmuka, dukungan modularitas komponen yang ketat, dan fleksibilitas untuk dibungkus ke dalam desktop runtime (seperti Tauri) di masa depan.
2. **DuckDB-Wasm sebagai Data Engine:** Dipilih daripada pemrosesan array JavaScript biasa karena DuckDB mampu mengeksekusi kalkulasi agregasi SQL (*Group By, Sum, Filter*) pada puluhan ribu baris data langsung di memori browser dengan kecepatan setara kode C++.
3. **Pustaka `exceljs` (Bukan sekadar SheetJS CE):** Dipilih karena `exceljs` memiliki dukungan native terhadap penulisan formula dinamis, manipulasi gaya sel detail (font, fill border), dan injeksi aturan *Conditional Formatting* yang diakui oleh aplikasi Microsoft Excel.
4. **Apache ECharts:** Dipilih sebagai mesin visualisasi karena memiliki katalog chart terlengkap, mendukung performa render Canvas/SVG yang cepat, serta konfigurasi berbasis JSON murni yang sangat mudah digenerate oleh AI.
5. **Universal OpenAI-Compatible Client Adapter:** Menggunakan satu modul konektor standar. Karena Ollama, LM Studio, vLLM, dan OpenRouter semuanya mengadopsi spesifikasi API OpenAI (`/v1/chat/completions`), aplikasi tidak memerlukan SDK terpisah untuk setiap provider.

---

### 8. RISKS & MITIGATIONS (Risiko & Strategi Mitigasi)

| Risiko Potensial | Tingkat Dampak | Rencana Mitigasi |
| :--- | :--- | :--- |
| **Halusinasi Sintaks Rumus oleh LLM Kecil:** Model lokal parameter kecil (3B–8B) berisiko salah menulis parameter rumus Excel. | **Tinggi** | Terapkan *System Prompt Guardrails* yang ketat dengan contoh *few-shot*. Tambahkan modul AST/Regex Parser lokal untuk memvalidasi tanda kurung dan nama fungsi sebelum disuntikkan ke sel spreadsheet. |
| **CORS Error pada Local LLM:** Browser memblokir panggilan API dari aplikasi web ke `localhost:11434` milik Ollama karena kebijakan keamanan browser. | **Sedang** | Sediakan dokumentasi panduan menjalankan Ollama dengan `OLLAMA_ORIGINS="*"`, serta sediakan *Next.js Route Handler Proxy* internal (`/api/ai/chat`) sebagai jalur alternatif fallback. |
| **Ukuran File HTML Standalone Terlalu Bengkak:** Memasukkan pustaka grafik dan dataset besar ke dalam satu file HTML berisiko membuat file lambat dimuat. | **Sedang** | Gunakan build ECharts yang telah di-*tree-shake* (hanya modul chart yang digunakan), kompres dataset JSON ke dalam format terenkapsulasi ringkas, dan batasi embed data mentah maksimal 5 MB per file HTML. |
| **Beban Perhitungan Rumus Berantai:** Rumus `=AI()` yang ditarik hingga ratusan baris dapat memicu *rate-limit* atau membuat GPU lokal panas. | **Tinggi** | Batasi eksekusi paralel rumus AI secara antrean (*concurrency queue limit* maksimal 3 request simultan), lengkapi dengan tombol *Pause/Cancel*, dan simpan hasil evaluasi di dalam *cache map* persisten. |
```

---

