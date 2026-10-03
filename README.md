# Portfolio Wahid Alimudin

Web profil profesional berkinerja tinggi untuk **Software Engineer, Developer Robot Trading MQL5 (MetaTrader 5), dan Afiliator**, dibangun dengan **React 18 + TypeScript + Vite + Tailwind CSS**.

## Karakteristik & Fitur Utama

- **Identitas & Karya Nyata**: Menampilkan 5 produk SaaS yang didirikan langsung:
  - `siakadponpes.com` (Sistem Informasi Akademik Pondok Pesantren)
  - `psbonline.id` (Penerimaan Siswa/Santri Baru Online)
  - `wanotif.web.id` (Mesin Notifikasi WhatsApp Gateway)
  - `smartapps.my.id` (Solusi Digital & Software House)
  - `presensirfid.web.id` (Sistem Presensi Berbasis IoT RFID & ESP32)
- **Layanan Robot Trading MQL5 MT5**:
  - Penjelasan arsitektur Expert Advisor (EA), manajemen risiko 1%, trailing stop dinamis, dan Strategy Tester.
  - Kartu simulator eksekusi tick trading interaktif.
- **Etalase Afiliasi Shopee & TikTok**:
  - Rekomendasi modul IoT (ESP32, RFID RC522), gear workstation coding, dan VPS Forex dengan keterbukaan afiliasi transparan.
- **Desain & Aksesibilitas Anti-Slop**:
  - Bebas pola AI generik (tanpa gradien ungu-biru slop, tanpa statistik palsu, tanpa testimoni buatan AI).
  - High Contrast (lolos standar WCAG AA 4.5:1+).
  - Dilengkapi toggle tema Dark / Light yang bekerja penuh dan persisten di browser.
  - Form konsultasi proyek yang langsung mengarahkan pesan terstruktur ke WhatsApp.

---

## Panduan Menjalankan di Lokal (Termux / Linux / PC)

1. Jalankan development server:
   ```bash
   npm run dev
   ```
2. Build aplikasi untuk produksi:
   ```bash
   npm run build
   ```
   Hasil build akan berada di folder `dist/`.

---

## Panduan Hosting di Cloudflare Pages

Proyek ini telah dikonfigurasi secara optimal untuk Cloudflare Pages (termasuk file SPA `_redirects` dan `_headers` di folder `public/`).

### Cara 1: Deploy Otomatis via Git (Direkomendasikan)
1. Commit dan push folder proyek ini ke repositori GitHub atau GitLab Anda:
   ```bash
   git add .
   git commit -m "feat: setup web profil wahid alimudin"
   git push origin main
   ```
2. Buka dashboard **Cloudflare**:
   - Masuk ke menu **Workers & Pages** > **Create application** > tab **Pages** > **Connect to Git**.
   - Pilih repositori GitHub Anda (`wahid-dev`).
3. Konfigurasi build setting Cloudflare Pages:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Klik **Save and Deploy**. Cloudflare Pages akan otomatis mem-build dan situs Anda langsung aktif dengan domain gratis `*.pages.dev` serta HTTPS gratis.

### Cara 2: Deploy Langsung via Wrangler CLI
Jika ingin mengunggah hasil build langsung dari terminal Termux:
```bash
npx wrangler pages deploy dist --project-name=wahid-dev
```
