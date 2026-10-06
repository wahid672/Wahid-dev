---
title: "Zombie Code dan Ketergantungan Paket Liar: Bahaya Codebase Bloat Hasil Vibe Coding"
slug: "zombie-code-dan-ketergantungan-paket-liar-aplikasi-vibe-coding"
date: "2026-10-06"
author: "Wahid Alimudin"
category: "Rekayasa Perangkat Lunak"
tags: ["Vibe Coding", "Zombie Code", "Codebase Bloat", "npm Dependencies", "Knip", "Bundle Optimization"]
summary: "Bagaimana kebiasaan prompting AI tanpa henti menghasilkan ratusan paket npm redundan, komponen mati yang tak pernah terpakai, dan cara memangkas ukuran bundle dengan Knip."
readingTime: "8 menit baca"
---

Pernahkah Anda memeriksa isi berkas `package.json` dan ukuran folder `node_modules` dari aplikasi yang Anda bangun secara maraton dengan asisten AI selama seminggu terakhir?

Sangat sering ditemukan bahwa sebuah aplikasi SaaS sederhana yang fungsinya hanya mencatat inventaris barang ternyata memiliki **140 dependensi npm berbeda**, ukuran folder `node_modules` mencapai 1,2 Gigabyte, dan waktu kompilasi (*build time*) memakan waktu lebih dari 6 menit. 

Fenomena ini dikenal sebagai **Codebase Bloat (Pembengkakan Basis Kode)** yang dipicu oleh penumpukan **Zombie Code (Kode Mati)** dan dependensi pustaka liar (*wild dependencies*).

---

## 1. Bagaimana Vibe Coding Memicu Penumpukan Dependensi Redundan?

Model AI tidak memiliki memori jangka panjang yang sempurna terhadap seluruh arsitektur proyek Anda saat menangani sesi prompt yang berbeda-beda:

* **Sesi Hari Senin:** Anda meminta AI: *"Buatkan pemilih tanggal di formulir pendaftaran"*. AI memasang paket `date-fns` dan `react-day-picker`.
* **Sesi Hari Rabu:** Anda meminta AI di sesi obrolan baru: *"Buatkan jadwal kalender di dashboard"*. AI yang tidak memeriksa `package.json` sebelumnya secara otomatis memasang `moment.js` dan `react-calendar`.
* **Sesi Hari Jumat:** Anda meminta fitur kalkulasi selisih hari. AI memasang pustaka ketiga: `dayjs`.

Hanya untuk urusan memanipulasi tanggal, aplikasi Anda kini memuat **tiga pustaka tanggal berbeda** ke dalam bundle JavaScript pengguna. Hal serupa sering terjadi pada pustaka ikon (memasang Lucide Icons, FontAwesome, dan Heroicons sekaligus di satu proyek yang sama) serta pustaka animasi visual.

---

## 2. Dampak Negatif Pembengkakan Kode pada Pengguna dan Bisnis

1. **Waktu Muat Pertama (*Initial Load*) Lambat:** Pengguna di koneksi internet seluler harus mengunduh berkas JavaScript berukuran 3 Megabyte sebelum halaman interaktif, yang langsung menghancurkan skor Core Web Vitals (LCP) di mata mesin pencari Google.
2. **Celah Keamanan Rantai Pasok (*Supply Chain Vulnerabilities*):** Setiap paket npm pihak ketiga yang Anda pasang membawa puluhan sub-dependensi lain. Semakin banyak paket liar yang tidak terpakai, semakin tinggi risiko aplikasi Anda terpapar malware atau paket berbahaya yang disusupi peretas.
3. **Konflik Versi Paket:** Paket-paket usang yang tidak terpakai sering kali menghalangi Anda untuk memperbarui versi framework utama (misal migrasi ke versi Next.js atau React terbaru) karena masalah ketidakcocokan dependensi (*peer dependency conflicts*).

---

## 3. Apa Itu Zombie Code dan Mengapa Sulit Dideteksi?

Zombie code adalah berkas komponen, fungsi bantuan (*utility functions*), atau file CSS yang awalnya dibuat oleh AI untuk fitur tertentu, namun ketika Anda mengubah konsep desain dan meminta alternatif lain, **AI membuatkan file baru tanpa menghapus file lama**.

File lama tersebut tetap tersimpan di folder proyek, tidak pernah diimpor oleh siapa pun, namun tetap dibaca oleh linter dan TypeScript compiler, memperlambat proses kompilasi harian Anda.

```text
src/
├── components/
│   ├── NewFancyModal.tsx       <-- Komponen aktif yang dipakai
│   ├── OldModalVersion1.tsx    <-- Zombie Code (Tertinggal sejak prompt 3 hari lalu)
│   ├── TestModalCopy.tsx       <-- Zombie Code
│   └── TempButtonDraft.tsx     <-- Zombie Code
```

---

## 4. Cara Mendeteksi dan Memangkas Kode Mati dengan Knip

Anda tidak perlu memeriksa ratusan berkas satu per satu secara manual. Ekosistem JavaScript modern memiliki alat penganalisis luar biasa bernama **Knip**.

Knip secara otomatis memindai seluruh proyek Anda, menelusuri rantai impor dari file utama, dan melaporkan berkas mana saja yang tidak pernah dipanggil, ekspor yang tidak terpakai, serta paket npm yang terdaftar di `package.json` namun tidak pernah diimpor di dalam kode.

### Langkah Penggunaan Knip:

Jalankan perintah langsung tanpa perlu menginstal permanen:

```bash
npx knip
```

Knip akan menyajikan laporan ringkas:
```text
Unused files (3)
  src/components/OldModalVersion1.tsx
  src/lib/temp-utils.ts
  src/styles/unused-animations.css

Unused dependencies (4)
  moment
  font-awesome
  react-calendar
  lodash
```

Anda cukup menghapus file-file mati tersebut dan mencopot paket yang tidak terpakai dengan `npm uninstall moment font-awesome react-calendar lodash`.

---

## 5. Periksa Ukuran Bundle dengan @next/bundle-analyzer

Untuk melihat visualisasi ukuran modul yang masuk ke browser pengguna, pasang penganalisis bundle resmi:

```bash
npm install @next/bundle-analyzer
```

Aktifkan di konfigurasi Next.js, lalu jalankan proses build dengan variabel lingkungan `ANALYZE=true npm run build`. Browser akan otomatis menampilkan peta gelembung visual interaktif (*treemap chart*) yang menunjukkan pustaka mana yang paling rakus memakan ruang memori.

Disiplin merawat kebersihan basis kode secara berkala memastikan aplikasi Anda tetap ramping, cepat diakses pengguna, dan mudah dirawat dalam jangka panjang.
