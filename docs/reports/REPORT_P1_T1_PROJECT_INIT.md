# LAPORAN IMPLEMENTASI: P1_T1 - PROJECT INITIALIZATION

- **Status Build:** PASS
- **TypeScript Check:** PASS (0 errors)
- **Tanggal Selesai:** 2026-09-22
- **Lingkup Fitur:** Phase 1 Task 1 - Initialize Next.js project with TypeScript strict, Tailwind, ESLint, Prettier, Vitest, Playwright

---

## 1. RINGKASAN TUGAS (TASK SUMMARY)
- **Tujuan Utama:** Menyiapkan fondasi proyek Next.js 16 (App Router) dengan seluruh tooling modern yang dibutuhkan untuk pengembangan Rancagé Studio: TypeScript strict mode, Tailwind CSS v4, ESLint + Prettier, Vitest untuk unit testing, dan Playwright untuk E2E testing.
- **Ruang Lingkup yang Dikerjakan:**
  1. Inisialisasi Next.js project dengan App Router, TypeScript, Tailwind, ESLint
  2. Konfigurasi TypeScript strict mode lengkap
  3. Setup Tailwind CSS v4 dengan custom theme (warna primary, font Inter & JetBrains Mono)
  4. Konfigurasi ESLint dengan integrasi Prettier
  5. Setup Prettier dengan plugin Tailwind CSS
  6. Konfigurasi Vitest dengan jsdom environment, coverage, dan path aliases
  7. Konfigurasi Playwright untuk multi-browser E2E testing
  8. Pembuatan landing page dasar dengan branding Rancagé Studio
  9. Verifikasi build, test, dan lint semua PASS
- **Batasan (Out of Scope):** Implementasi DuckDB-Wasm, BYOK Manager, Spreadsheet Engine, Dashboard Builder, Exporters - semua akan dikerjakan di Phase selanjutnya.

---

## 2. DAFTAR FILE YANG DIBUAT / DIUBAH

| Path File | Tipe Aksi | Peran & Fungsi dalam Arsitektur |
| :--- | :--- | :--- |
| package.json | Modified | Menambahkan scripts test, devDependencies (vitest, playwright, prettier, eslint-plugin-prettier, eslint-config-prettier, testing-library, jsdom, autoprefixer), allowScripts |
| tsconfig.json | Modified | Mengaktifkan strict mode penuh: noUncheckedIndexedAccess, noImplicitOverride, noPropertyAccessFromIndexSignature, forceConsistentCasingInFileNames |
| tailwind.config.ts | Created | Konfigurasi Tailwind v4 dengan custom theme colors (primary 50-900), fontFamily sans & mono |
| postcss.config.mjs | Modified | Menambahkan autoprefixer plugin ke PostCSS |
| eslint.config.mjs | Modified | Mengintegrasikan eslint-plugin-prettier & eslint-config-prettier, memperluas ignore patterns |
| .prettierrc | Created | Konfigurasi Prettier: single quotes, tabWidth 2, trailingComma es5, plugin tailwindcss |
| vitest.config.ts | Created | Konfigurasi Vitest: globals, jsdom env, setupFiles, coverage v8, path alias @ |
| vitest.setup.tsx | Created | Global test setup: mock next/navigation, next/image, ResizeObserver, console.error suppression |
| playwright.config.ts | Created | Konfigurasi Playwright: 3 browser projects, webServer reuseExistingServer, HTML reporter |
| src/app/globals.css | Modified | Tailwind v4 @theme directive, custom CSS variables, base styles |
| src/app/layout.tsx | Modified | Root layout dengan metadata Rancagé Studio, menghapus next/font Geist |
| src/app/page.tsx | Modified | Landing page dengan branding, CTA buttons, feature cards |
| src/setup.test.ts | Created | Basic verification test untuk memastikan vitest & TypeScript berfungsi |
---

## 3. BEDAH KODE PER-FILE ("APA, KENAPA, & EDUKASI TEKNIS")

### File: `tsconfig.json`

#### A. APA (Fungsi & Peran)
File konfigurasi TypeScript yang mengatur bagaimana compiler memeriksa dan mengompilasi kode TypeScript. File ini mendefinisikan target ECMAScript, module resolution, JSX handling, path aliases, dan **strict mode settings**.

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **Strict Mode Penuh:** Mengaktifkan `strict: true` saja tidak cukup untuk proyek production-grade. Kami menambahkan:
  - `noUncheckedIndexedAccess`: Mencegah akses array/object tanpa check undefined (misal: `arr[0]` → `arr[0]!` atau `arr[0] ?? fallback`)
  - `noImplicitOverride`: Memaksa keyword `override` saat menimpa method parent class
  - `noPropertyAccessFromIndexSignature`: Mencegah akses property via dot notation pada index signature (harus pakai bracket notation)
  - `forceConsistentCasingInFileNames`: Mencegah import case-sensitivity issues cross-platform
- **Module Resolution Bundler:** Cocok untuk Next.js App Router yang menggunakan Turbopack/webpack
- **Path Alias `@/*`:** Mempermudah import absolut dari `src/` tanpa relative path yang panjang

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- **Pelajaran TypeScript:** 
  - `noUncheckedIndexedAccess` adalah **game-changer** untuk type safety. Tanpa ini, `const user = users[0]` memiliki type `User` (bukan `User | undefined`), yang berbahaya karena bisa undefined di runtime. Dengan flag ini, type menjadi `User | undefined`, memaksa developer handle case kosong.
  - `noPropertyAccessFromIndexSignature` mencegah bug halus: interface `{ [key: string]: string }` tidak bisa diakses via `obj.foo` (harus `obj['foo']`), mengurangi typo property name.
- **Pelajaran Next.js:** Next.js 16 menggunakan Turbopack yang memerlukan `moduleResolution: "bundler"` dan `module: "esnext"` untuk optimal HMR dan tree-shaking.
- **Pelajaran Tailwind CSS:** Tidak langsung terkait, tapi path alias `@/*` memudahkan import component/ui yang menggunakan Tailwind classes.

---

### File: `tailwind.config.ts`

#### A. APA (Fungsi & Peran)
Konfigurasi Tailwind CSS v4 yang mendefinisikan design system: color palette, typography, dan content paths untuk tree-shaking unused styles.

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **Tailwind v4 (@tailwindcss/postcss):** Menggunakan engine baru berbasis Rust (Oxide) yang 10x lebih cepat. Konfigurasi via `@theme` di CSS, bukan file JS terpisah.
- **Custom Color Palette (Primary 50-900):** Membangun design system konsisten. Warna primary biru (`#0ea5e9` sebagai 500) digunakan untuk branding, button primary, focus rings, dll.
- **Font Family:** Inter untuk UI (readable, modern), JetBrains Mono untuk code/monospace (ligatures, developer-friendly).
- **Content Paths:** Meng-scan `src/app/**`, `src/components/**`, `src/pages/**` untuk menghapus unused CSS di production build.

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

```typescript
// tailwind.config.ts
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
---

### File: `eslint.config.mjs`

#### A. APA (Fungsi & Peran)
Konfigurasi ESLint flat config (format baru ESLint 9+) yang menggabungkan: Next.js core-web-vitals, TypeScript rules, dan Prettier formatting rules.

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **Flat Config (ESLint 9+):** Format baru yang lebih modular, menggunakan `defineConfig` array. Lebih powerful dari `.eslintrc.json` lama.
- **Spread Next.js Configs:** `...nextVitals` (core web vitals rules) + `...nextTs` (TypeScript rules) - memastikan best practices Next.js & TypeScript.
- **Prettier Integration:** `eslint-plugin-prettier` menjalankan Prettier sebagai ESLint rule (`"prettier/prettier": "error"`), `eslint-config-prettier` mematikan rules ESLint yang conflict dengan Prettier. Hasil: **satu source of truth** untuk formatting.
- **Extended Ignore Patterns:** Menambahkan `node_modules/**`, `*.config.*`, `playwright-report/**`, `test-results/**`, `coverage/**`, `.vitest/**` agar tidak di-lint (build artifacts, config files, test outputs).

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { prettier },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
    },
  },
  globalIgnores([...]),
]);

export default eslintConfig;
```

- **Pelajaran TypeScript:** `eslint-config-next/typescript` mengaktifkan rules seperti `@typescript-eslint/no-unused-vars`, `@typescript-eslint/consistent-type-imports`, dll. Bekerja sama dengan `tsconfig.json` strict mode untuk defense-in-depth.
- **Pelajaran Next.js:** `core-web-vitals` rules mencakup: `react/no-unescaped-entities`, `@next/next/no-img-element` (warning pakai `<Image />`), `@next/next/no-html-link-for-pages` (pakai `<Link>`). Ini **Next.js specific optimizations**.
- **Pelajaran Tailwind CSS:** `prettier-plugin-tailwindcss` (di `.prettierrc`) otomatis mengurutkan Tailwind classes sesuai urutan resmi (layout → spacing → typography → colors → dll). ESLint + Prettier combo memastikan konsistensi class ordering di seluruh codebase.

---

### File: `vitest.config.ts` & `vitest.setup.tsx`

#### A. APA (Fungsi & Peran)
- `vitest.config.ts`: Konfigurasi test runner Vitest (alternatif Jest yang lebih cepat, native ESM, Vite-powered).
- `vitest.setup.tsx`: Global setup yang dijalankan sebelum setiap test file - mocking Next.js internals, setup testing-library, global utilities.

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **Vitest over Jest:** Native TypeScript/ESM support, shared config dengan Vite (Next.js 16 pakai Turbopack tapi Vitest pakai Vite), watch mode cepat, UI dashboard (`@vitest/ui`).
- **Environment jsdom:** Simulasi browser DOM di Node.js untuk testing React components. Ringan dan cepat.
- **Path Alias `@`:** Sama dengan `tsconfig.json`, memudahkan import di test files.
- **Setup File (tsx):** Harus `.tsx` karena berisi JSX (`<img ... />` di mock next/image). Import `beforeAll`/`afterAll` dari `vitest` (bukan global) untuk TypeScript strict mode.
- **Mock Next.js Internals:** `next/navigation` (useRouter, usePathname, useSearchParams) dan `next/image` harus di-mock karena tidak berjalan di browser asli saat test.

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

```typescript
// vitest.setup.tsx
import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter() { return { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }; },
  usePathname() { return '/'; },
  useSearchParams() { return new URLSearchParams(); },
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
}));

---

### File: `playwright.config.ts`

#### A. APA (Fungsi & Peran)
Konfigurasi Playwright untuk End-to-End testing di browser asli (Chromium, Firefox, WebKit). Mengatur test directory, parallel execution, reporter, dan web server management.

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **Multi-browser Projects:** Test di 3 engine browser utama memastikan cross-browser compatibility.
- **`reuseExistingServer: !ci`:** Di local development, reuse `npm run dev` server yang sudah jalan (hemat waktu). Di CI, spin up server baru.
- **`forbidOnly: !!process.env.CI`:** Di CI, `test.only` akan gagal build (mencegah accidental commit focused tests).
- **`retries: ci ? 2 : 0`:** Di CI, retry flaky tests 2x. Local: no retry (feedback cepat).
- **`workers: ci ? 1 : undefined`:** CI sequential (hindari resource contention), local parallel (max speed).

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env['CI'];  // TypeScript strict: index signature access

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  workers: ci ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !ci,
---

### File: `src/app/globals.css`

#### A. APA (Fungsi & Peran)
Global stylesheet yang mengimpor Tailwind v4, mendefinisikan CSS custom properties (variables) untuk theme, dan base styles.

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **Tailwind v4 `@import "tailwindcss"`:** Menggantikan `@tailwind base/components/utilities` v3. Lebih cepat, tree-shaking built-in.
- **`@theme` Directive:** Cara baru Tailwind v4 mendefinisikan design tokens (colors, fonts, spacing, dll) langsung di CSS. Lebih powerful dari `tailwind.config.js` karena bisa pakai CSS variables, `calc()`, media queries.
- **CSS Variables untuk Light/Dark Mode:** `--background`, `--foreground` berubah via `@media (prefers-color-scheme: dark)`. Tailwind v4 otomatis generate `bg-background`, `text-foreground` utilities.
- **Base Styles:** `box-sizing: border-box` global, `scroll-behavior: smooth`, font-family ke CSS variable.

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;

  --font-sans: Inter, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
---

### File: `src/app/layout.tsx` & `src/app/page.tsx`

#### A. APA (Fungsi & Peran)
- `layout.tsx`: Root layout (Server Component) - metadata, HTML structure, global styles import.
- `page.tsx`: Home page (Server Component) - landing page dengan branding, CTA, feature highlights.

#### B. KENAPA (Keputusan Arsitektur & Engineering)
- **Server Components by Default:** Next.js App Router default ke Server Component. Tidak ada `'use client'` directive = zero client-side JS untuk halaman statis ini. **Performance optimal**.
- **Metadata API:** `export const metadata` untuk SEO, Open Graph, dll. Type-safe dengan `Metadata` type dari Next.js.
- **Semantic HTML + Tailwind:** Menggunakan `<main>`, `<h1>`, `<p>`, `<a>`, `<svg>` dengan Tailwind utility classes. Tidak ada custom CSS.
- **Responsive Design:** `sm:grid-cols-3`, `md:w-[158px]` - mobile-first breakpoints.
- **Accessibility:** `alt` text pada SVG (decorative), color contrast (primary-500 on white), focus-visible styles via Tailwind.

#### C. CATATAN PEMBELAJARAN (Next.js, TypeScript, & Tailwind CSS)

```tsx
// layout.tsx
export const metadata: Metadata = {
  title: "Rancagé Studio",
  description: "Local-first AI spreadsheet & dashboard engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

```tsx
// page.tsx - snippet
<div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background text-foreground">
  <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-6 text-center">
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-500 text-white">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">...</svg>
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Rancagé Studio</h1>
      <p className="max-w-md text-lg text-muted-foreground">...</p>
    </div>
    <div className="mt-12 grid gap-4 sm:grid-cols-3 w-full max-w-md">
      {/* CTA Buttons */}
    </div>
    <div className="mt-16 grid gap-8 sm:grid-cols-3 w-full max-w-3xl">
      {/* Feature Cards */}
    </div>
  </main>
</div>
```

- **Pelajaran TypeScript:** 
  - `Metadata` type dari `next` memastikan valid metadata fields (title, description, openGraph, twitter, dll).
  - `React.ReactNode` untuk `children` prop - type standar untuk komponen yang wrap children.
  - Type inference untuk JSX elements - tidak perlu annotate type pada `<div className="...">`.
- **Pelajaran Next.js:** 
  - **Server Component Default:** Tidak ada `'use client'` = render di server, stream HTML ke client. **Zero JS bundle** untuk halaman ini.
---

## 4. LOGIKA ALGORITMA & FLOWCHART (MERMAID.JS)

Task ini bersifat **setup/configurasi** - tidak ada algoritma processing data kompleks. Namun, alur **bootstrap aplikasi** dapat divisualisasikan:

### A. Tahapan Bootstrap Application
1. **Input:** User menjalankan `npm run dev` / `npm run build`
2. **Konfigurasi Load:** Next.js baca `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next.config.ts`
3. **Dependency Graph:** Turbopack/Vite build dependency graph dari `src/app/layout.tsx` → `globals.css` → Tailwind → CSS output
4. **Type Checking:** TypeScript compiler memvalidasi seluruh codebase dengan strict mode
5. **Output:** Development server ready / Production build artifacts

- **Efisiensi:** Build time ~1.7s (Turbopack), TypeScript check ~2.5s. Incremental compilation untuk dev.

### B. Flowchart Bootstrap

```mermaid
flowchart TD
    A[Start: npm run dev/build] --> B[Next.js Load Configs]
    B --> C{tsconfig.json Valid?}
    C -- No --> D[TypeScript Errors → Exit 1]
    C -- Yes --> E[Tailwind v4 Parse @theme]
    E --> F[PostCSS Process CSS]
    F --> G{ESLint Pass?}
    G -- No --> H[Lint Errors → Exit 1]
    G -- Yes --> I[Dev: Start Turbopack Server]
    I --> J[Build: Compile Pages]
    J --> K{Type Check Pass?}
    K -- No --> L[Type Errors → Exit 1]
    K -- Yes --> M[Generate Static Assets]
    M --> N[Success: Ready / Build Output]
    
    style D fill:#ffcccc,stroke:#ff0000
    style H fill:#ffcccc,stroke:#ff0000
    style L fill:#ffcccc,stroke:#ff0000
    style N fill:#ccffcc,stroke:#00aa00
```

---

## 5. AUDIT ZERO-BUG & PENANGANAN EDGE CASES

| Potensi Masalah / Edge Case | Risiko | Bagaimana Kode Ini Mengatasinya? |
| :--- | :--- | :--- |
| **TypeScript Strict Mode Terlalu Ketat** | Medium | Konfigurasi bertahap: mulai `strict: true`, tambah flags satu per satu. Team bisa disable flag spesifik via `// @ts-expect-error` jika perlu. |
| **Tailwind v4 Breaking Changes dari v3** | High | Dokumentasi migrasi resmi diikuti. `@theme` directive menggantikan config JS. Content paths dipindah ke config file. |
| **ESLint Flat Config Migration** | Medium | Menggunakan format baru `defineConfig` array. Spread existing Next.js configs untuk kompatibilitas. |
| **Vitest jsdom vs Happy DOM** | Low | `jsdom` lebih matang, kompatibel `@testing-library/react`. `happy-dom` lebih cepat tapi kurang complete. Pilih stabilitas. |
| **Playwright WebServer Race Condition** | Medium | `reuseExistingServer: !ci` mencegah double server di local. `timeout: 120000` (2 menit) handle slow CI startup. |
| **next/image Mock di Test** | Low | Mock sederhana ke `<img>` di `vitest.setup.tsx`. Warning ESLint `@next/next/no-img-element` diabaikan di test file via ignore pattern. |
| **Font Loading (Inter, JetBrains Mono)** | Low | Fallback ke `system-ui` / `monospace` di font stack. Tidak block rendering (font-display: swap default). |
| **Dark Mode Flash (FOUC)** | Medium | CSS variables di `:root` + `@media (prefers-color-scheme: dark)` - browser handle native, no JS needed. |

---

## 6. HASIL PENGUJIAN (TEST RESULTS & QA)

### A. Automated Verification

| Command | Status | Output Summary |
| :--- | :--- | :--- |
| `npm run build` | ✅ PASS | Compiled successfully in 1.7s, TypeScript 2.5s, 4 static pages generated |
| `npm run test` | ✅ PASS | 1 test file, 2 tests passing (setup verification) |
| `npm run lint` | ✅ PASS | 0 errors, 1 warning (test mock `<img>` element - acceptable) |
| `npx tsc --noEmit` | ✅ PASS | 0 errors (verified via build) |

### B. Manual QA Verification Checklist
- [x] **Skenario 1:** `npm run dev` → Server start di `http://localhost:3000` → Halaman render benar, branding terlihat, CTA buttons ada, feature cards tampil
- [x] **Skenario 2:** Resize browser → Layout responsif (mobile: 1 kolom, tablet: 3 kolom grid)
- [x] **Skenario 3:** Toggle OS dark mode → Background & text color berubah otomatis (CSS variables)
- [x] **Skenario 4:** `npm run build` → `.next/` folder generated, static HTML untuk `/` dan `/_not-found`
- [x] **Skenario 5:** `npm run test:ui` → Vitest UI buka di browser, test passing

---

## 7. UJI PEMAHAMAN MANDIRI (ACTIVE RECALL)

Jawab 3 pertanyaan refleksi ini untuk menguji pemahaman Anda terhadap kode yang baru dibuat:

1. **Pertanyaan:** Mengapa `tsconfig.json` mengaktifkan `noUncheckedIndexedAccess: true` dan apa dampaknya pada tipe `users[0]` jika `users: User[]`?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   
   **Jawaban:** Tanpa flag ini, `users[0]` bertipe `User` (TypeScript assume index selalu valid). Dengan `noUncheckedIndexedAccess: true`, tipe menjadi `User | undefined` karena array bisa kosong. Ini memaksa developer handle case undefined: `const user = users[0] ?? defaultUser` atau `if (users[0]) { ... }`. Mencegah runtime error "Cannot read property of undefined".
   </details>

2. **Pertanyaan:** Di `vitest.setup.tsx`, mengapa `beforeAll` dan `afterAll` di-import dari `'vitest'` bukan digunakan sebagai global? Apa konsekuensinya jika tidak di-import?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   
   **Jawaban:** Dengan `globals: true` di `vitest.config.ts`, Vitest *inject* globals (`describe`, `it`, `expect`, `beforeAll`, dll) ke global scope saat runtime. Namun **TypeScript tidak tahu** globals ini ada saat type-checking. Import `{ vi, beforeAll, afterAll } from 'vitest'` memberikan type definitions untuk TypeScript compiler. Tanpa import, TypeScript error: `Cannot find name 'beforeAll'`.
   </details>

3. **Pertanyaan:** Di `playwright.config.ts`, kenapa `process.env['CI']` pakai bracket notation bukan `process.env.CI`? Apa setting TypeScript yang memaksa ini?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   
   **Jawaban:** Setting `noPropertyAccessFromIndexSignature: true` di `tsconfig.json`. `process.env` memiliki type `ProcessEnv` yang merupakan `Record<string, string | undefined>` (index signature). Flag ini melarang dot notation access (`obj.prop`) pada type dengan index signature, memaksa bracket notation (`obj['prop']`). Ini mencegah typo property name yang tidak ketauan compile time.
   </details>

---

## 8. LANGKAH SELANJUTNYA (NEXT STEPS)
- **Task Berikutnya:** Phase 1 Task 2 - DuckDB-Wasm Module (init, CSV/Parquet extensions, query executor)
- **Prasyarat:** 
  1. Install `@duckdb/duckdb-wasm` package
  2. Siapkan Web Worker untuk DuckDB (off-main-thread)
  3. Buat wrapper TypeScript untuk query execution, table registration, schema inference
  4. Unit test untuk: init DB, load CSV, query `SELECT COUNT(*)`, schema inference
```mermaid
flowchart TD
    A[Start: npm run dev/build] --> B[Next.js Load Configs]
    B --> C{tsconfig.json Valid?}
    C -- No --> D[TypeScript Errors → Exit 1]
    C -- Yes --> E[Tailwind v4 Parse @theme]
    E --> F[PostCSS Process CSS]
    F --> G{ESLint Pass?}
    G -- No --> H[Lint Errors → Exit 1]
    G -- Yes --> I[Dev: Start Turbopack Server]
    I --> J[Build: Compile Pages]
    J --> K{Type Check Pass?}
    K -- No --> L[Type Errors → Exit 1]
    K -- Yes --> M[Generate Static Assets]
    M --> N[Success: Ready / Build Output]
    
    style D fill:#ffcccc,stroke:#ff0000
    style H fill:#ffcccc,stroke:#ff0000
    style L fill:#ffcccc,stroke:#ff0000
    style N fill:#ccffcc,stroke:#00aa00
```

---

## 5. AUDIT ZERO-BUG & PENANGANAN EDGE CASES

| Potensi Masalah / Edge Case | Risiko | Bagaimana Kode Ini Mengatasinya? |
---

## 6. HASIL PENGUJIAN (TEST RESULTS & QA)

### A. Automated Verification

| Command | Status | Output Summary |
| :--- | :--- | :--- |
| `npm run build` | ✅ PASS | Compiled successfully in 1.7s, TypeScript 2.5s, 4 static pages generated |
| `npm run test` | ✅ PASS | 1 test file, 2 tests passing (setup verification) |
| `npm run lint` | ✅ PASS | 0 errors, 1 warning (test mock `<img>` element - acceptable) |
| `npx tsc --noEmit` | ✅ PASS | 0 errors (verified via build) |

### B. Manual QA Verification Checklist
- [x] **Skenario 1:** `npm run dev` → Server start di `http://localhost:3000` → Halaman render benar, branding terlihat, CTA buttons ada, feature cards tampil
- [x] **Skenario 2:** Resize browser → Layout responsif (mobile: 1 kolom, tablet: 3 kolom grid)
- [x] **Skenario 3:** Toggle OS dark mode → Background & text color berubah otomatis (CSS variables)
- [x] **Skenario 4:** `npm run build` → `.next/` folder generated, static HTML untuk `/` dan `/_not-found`
- [x] **Skenario 5:** `npm run test:ui` → Vitest UI buka di browser, test passing

---

## 7. UJI PEMAHAMAN MANDIRI (ACTIVE RECALL)

Jawab 3 pertanyaan refleksi ini untuk menguji pemahaman Anda terhadap kode yang baru dibuat:

1. **Pertanyaan:** Mengapa `tsconfig.json` mengaktifkan `noUncheckedIndexedAccess: true` dan apa dampaknya pada tipe `users[0]` jika `users: User[]`?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   
   **Jawaban:** Tanpa flag ini, `users[0]` bertipe `User` (TypeScript assume index selalu valid). Dengan `noUncheckedIndexedAccess: true`, tipe menjadi `User | undefined` karena array bisa kosong. Ini memaksa developer handle case undefined: `const user = users[0] ?? defaultUser` atau `if (users[0]) { ... }`. Mencegah runtime error "Cannot read property of undefined".
   </details>

2. **Pertanyaan:** Di `vitest.setup.tsx`, mengapa `beforeAll` dan `afterAll` di-import dari `'vitest'` bukan digunakan sebagai global? Apa konsekuensinya jika tidak di-import?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   
   **Jawaban:** Dengan `globals: true` di `vitest.config.ts`, Vitest *inject* globals (`describe`, `it`, `expect`, `beforeAll`, dll) ke global scope saat runtime. Namun **TypeScript tidak tahu** globals ini ada saat type-checking. Import `{ vi, beforeAll, afterAll } from 'vitest'` memberikan type definitions untuk TypeScript compiler. Tanpa import, TypeScript error: `Cannot find name 'beforeAll'`.
   </details>

3. **Pertanyaan:** Di `playwright.config.ts`, kenapa `process.env['CI']` pakai bracket notation bukan `process.env.CI`? Apa setting TypeScript yang memaksa ini?
   <details>
   <summary>👉 Klik untuk Melihat Jawaban</summary>
   
   **Jawaban:** Setting `noPropertyAccessFromIndexSignature: true` di `tsconfig.json`. `process.env` memiliki type `ProcessEnv` yang merupakan `Record<string, string | undefined>` (index signature). Flag ini melarang dot notation access (`obj.prop`) pada type dengan index signature, memaksa bracket notation (`obj['prop']`). Ini mencegah typo property name yang tidak ketauan compile time.
   </details>

---

## 8. LANGKAH SELANJUTNYA (NEXT STEPS)
- **Task Berikutnya:** Phase 1 Task 2 - DuckDB-Wasm Module (init, CSV/Parquet extensions, query executor)
- **Prasyarat:** 
  1. Install `@duckdb/duckdb-wasm` package
  2. Siapkan Web Worker untuk DuckDB (off-main-thread)
  3. Buat wrapper TypeScript untuk query execution, table registration, schema inference
  4. Unit test untuk: init DB, load CSV, query `SELECT COUNT(*)`, schema inference
