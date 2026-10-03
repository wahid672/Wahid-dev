---
title: "Panduan Lengkap Instalasi Antigravity CLI di Termux Android: Coding AI Agent di Smartphone"
slug: "cara-instal-antigravity-cli-termux-android-ai"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["Termux", "Android", "Antigravity CLI", "Gemini Pro", "AI Coding Agent", "DevOps"]
summary: "Tutorial step by step menginstal Google Antigravity CLI (agy) di Termux Android menggunakan Termux Void Repo dan menghubungkannya dengan akun Gemini Pro."
readingTime: "6 menit baca"
---

Perkembangan teknologi kecerdasan buatan kini memungkinkan rekayasa perangkat lunak dilakukan tanpa keterbatasan perangkat keras desktop. Melalui hadirnya Google Antigravity (AGY), para pengembang dapat memanfaatkan coding agent otonom yang mampu menganalisis basis kode, menyunting berkas secara presisi, hingga mengeksekusi pengujian aplikasi langsung dari terminal.

Menariknya, seluruh kemampuan tersebut dapat dijalankan langsung di ponsel Android menggunakan Termux, emulator terminal Linux yang andal. Artikel ini menyajikan panduan teknis langkah demi langkah untuk menginstal Antigravity CLI (`agy`) di Termux Android dan menghubungkannya dengan akun Gemini Pro Anda.

---

## Mengapa Memilih APK Termux dari GitHub Releases?

Sebelum memulai proses instalasi, penting untuk dipahami bahwa Anda **tidak boleh** menginstal Termux melalui Google Play Store. 

Sejak akhir tahun 2020, repositori Termux di Google Play Store sudah dihentikan (*deprecated*) akibat kebijakan pembatasan Target SDK Android dari Google. Akibatnya, versi Play Store tidak lagi menerima pembaruan paket dan akan memicu error `repository is under maintenance or down` saat Anda menjalankan perintah instalasi paket.

Versi resmi yang aktif dan terus diperbarui secara berkala dikelola langsung oleh komunitas pengembang di GitHub Releases.

---

## Langkah 1: Unduh dan Pasang APK Termux Universal

Langkah pertama adalah mendapatkan paket instalasi APK Termux resmi:

1. Buka peramban di ponsel Android Anda dan kunjungi halaman rilis resmi Termux:
   [https://github.com/termux/termux-app/releases](https://github.com/termux/termux-app/releases)
2. Gulir ke bagian **Assets** pada versi rilis stabil paling baru.
3. Unduh berkas dengan penamaan universal, contohnya:
   `termux-app_v..._universal.apk`
   *(Varian universal kompatibel dengan semua jenis arsitektur prosesor ponsel, baik ARM64, ARMv7, maupun x86_64).*
4. Pasang (*install*) berkas APK tersebut di perangkat Android Anda. Jika muncul peringatan keamanan mengenai instalasi dari sumber tidak dikenal, berikan izin sementara untuk melanjutkan proses pemasangan.
5. Buka aplikasi Termux yang baru terpasang.

*(Opsional tapi sangat disarankan)*: Jalankan perintah berikut di jendela Termux untuk memberikan akses membaca dan menulis ke penyimpanan internal perangkat Anda:

```bash
termux-setup-storage
```
Tekan tombol **Allow** atau **Izinkan** pada jendela konfirmasi yang muncul di layar.

---

## Langkah 2: Pembaruan Paket Sistem Termux

Setelah aplikasi terbuka, langkah wajib berikutnya adalah menyegarkan daftar paket dan memperbarui seluruh pustaka bawaan ke versi paling mutakhir:

```bash
pkg update -y && pkg upgrade -y
```

**Penjelasan Perintah:**
- `pkg update`: Mengambil metadata repositori terbaru dari server mirror Termux.
- `pkg upgrade`: Memperbarui binari penting, pustaka C/C++ standar, OpenSSL, sertifikat CA, serta utilitas shell ke versi stabil terbaru.
- Argumen `-y`: Memberikan konfirmasi otomatis (*yes*) sehingga proses pembaruan berjalan mulus tanpa berhenti meminta penekanan tombol Enter berkali-kali.

Jika di tengah proses muncul pertanyaan mengenai pembaruan konfigurasi berkas (`default [N]`), tekan saja tombol **Enter** untuk mempertahankan konfigurasi default.

---

## Langkah 3: Integrasi Termux Void Repository

Antigravity CLI dikemas secara khusus agar dapat berjalan lancar di lingkungan Android non-root melalui ekosistem Termux Void. Untuk memasukkan repositori Termux Void ke dalam manajer paket `apt` Termux, jalankan perintah satu baris berikut:

```bash
curl -sL https://github.com/termuxvoid/repo/raw/main/install.sh | bash
```

**Mekanisme Kerja Script:**
1. Mengunduh script installer resmi dari repositori Termux Void via `curl` secara senyap (`-sL`).
2. Mendaftarkan kunci penandatanganan GPG resmi agar integritas paket terjamin keasliannya.
3. Menambahkan alamat repositori Termux Void ke direktori konfigurasi sumber APT di folder `sources.list.d/` (lokasi: `/data/data/com.termux/files/usr/etc/apt/sources.list.d/`).
4. Menjalankan sinkronisasi indeks paket secara otomatis sehingga katalog paket baru langsung dikenali oleh Termux.

---

## Langkah 4: Instalasi Antigravity CLI (`antigravity-cli`)

Setelah repositori Termux Void terdaftar dengan baik, paket Antigravity CLI siap untuk dipasang:

```bash
pkg install antigravity-cli
```

Sistem manajer paket akan menghitung dependensi yang diperlukan, mengunduh pustaka runtime yang relevan, dan memasang binari eksekusi bernama `agy` ke dalam sistem path Termux Anda.

Untuk memverifikasi bahwa instalasi telah berhasil terpasang sempurna, periksa bantuan CLI dengan perintah:

```bash
agy --help
```

Jika teks panduan parameter CLI Antigravity tampil di layar, maka instalasi engine CLI Anda telah sukses 100%.

---

## Langkah 5: Menjalankan Antigravity dan Menghubungkan Akun Gemini Pro

Sekarang, saatnya mengaktifkan agen coding AI Anda.

### 1. Membuka Antigravity
Ketikkan perintah singkat berikut di terminal Termux Anda:

```bash
agy
```

### 2. Proses Otentikasi Gemini Pro
Pada peluncuran pertama kali, Antigravity CLI akan mendeteksi bahwa sesi belum terotentikasi dan secara otomatis memandu Anda menghubungkan akun Google:

1. Antigravity akan menyajikan tautan otorisasi OAuth di jendela terminal.
2. Salin tautan tersebut atau buka langsung di browser Chrome pada smartphone Anda.
3. Masuk (*login*) menggunakan akun Google Anda yang memiliki akses ke layanan **Gemini Pro**.
4. Setujui izin akses yang diminta untuk Antigravity CLI.
5. Setelah berhasil, salin token otentikasi yang disediakan di peramban, lalu tempelkan (*paste*) kembali ke prompt input Termux, kemudian tekan **Enter**.

Setelah otentikasi terverifikasi, Anda akan disambut oleh antarmuka TUI (Terminal User Interface) interaktif Antigravity yang siap menerima instruksi rekayasa kode secara real-time.

---

## Langkah 6: Alur Kerja & Perintah Penting Antigravity di Ponsel

Berikut sejumlah tips esensial untuk memaksimalkan produktivitas saat ngoding menggunakan Antigravity di Android:

### Navigasi & Slash Commands
Di dalam antarmuka obrolan `agy`, Anda dapat memanfaatkan berbagai perintah cepat (*slash commands*):
- `/help`: Menampilkan panduan ringkas dan seluruh pintasan perintah yang didukung.
- `/plan`: Menginstruksikan agen AI untuk menyusun rencana arsitektur teknis bertahap sebelum mengeksekusi perubahan berkas.
- `/schedule`: Mengatur jadwal pengingat atau otomatisasi tugas di latar belakang.
- `/quit` atau tombol `Ctrl + D`: Keluar dari sesi interaktif Antigravity secara aman.

### Menjaga Sesi Tetap Berjalan (Wake Lock)
Sistem operasi Android memiliki manajemen baterai agresif yang dapat menghentikan proses di latar belakang ketika layar ponsel padam. Agar agen coding Anda tidak terhenti saat sedang menganalisis kode yang panjang, aktifkan fitur *Wake Lock* Termux:

1. Tarik panel notifikasi Android Anda ke bawah.
2. Pada notifikasi Termux, ketuk tombol **Acquire Wakelock**.
3. Atau jalankan perintah terminal berikut:
   ```bash
   termux-wake-lock
   ```

### Memanfaatkan Bilah Tombol Ekstra (Extra Keys)
Menulis kode di layar sentuh ponsel membutuhkan tombol navigasi khusus seperti `Tab`, `Ctrl`, `Alt`, `ESC`, dan tanda panah. Termux secara default menyediakan deretan tombol tambahan di atas keyboard virtual Anda. Anda dapat menggunakannya untuk berpindah opsi di Antigravity TUI dengan mudah.

---

## Kesimpulan

Mengembangkan perangkat lunak kini tidak lagi mensyaratkan laptop berbobot berat di meja kerja. Dengan memadukan portabilitas **Termux** di Android dan kecerdasan reasoning **Antigravity CLI bertenaga Gemini Pro**, Anda memiliki asisten rekayasa kode yang cerdas, siap mengaudit repositori, menyelesaikan bug, dan menulis fitur baru langsung dari genggaman tangan Anda.

Selamat mencoba, dan rasakan pengalaman pair-programming modern di smartphone Anda!
