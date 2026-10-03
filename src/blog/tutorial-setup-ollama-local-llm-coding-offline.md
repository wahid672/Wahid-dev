---
title: "Panduan Lengkap Setup Ollama: Menjalankan Local LLM untuk Coding Offline Cepat"
slug: "tutorial-setup-ollama-local-llm-coding-offline"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["Ollama", "Local LLM", "AI", "DevOps", "Productivity"]
summary: "Tutorial menjalankan model bahasa AI secara mandiri di komputer lokal dengan Ollama, integrasi ekstensi editor, dan optimasi GPU VRAM."
readingTime: "6 menit baca"
---

Privasi data kode dan ketergantungan pada koneksi internet sering menjadi kendala utama developer saat menggunakan layanan AI cloud publik. Bagi tim rekayasa perangkat lunak yang menangani basis kode privat, proprietary, atau regulasi perbankan yang ketat, mengirim potongan kode ke server pihak ketiga bukanlah opsi yang dapat diterima.

Hadirnya **Ollama** mengubah lanskap tersebut. Ollama menyederhanakan eksekusi Large Language Model (LLM) berskala besar di mesin lokal hanya dengan satu perintah terminal, memanfaatkan akselerasi GPU secara optimal dengan konsumsi sumber daya yang efisien.

Artikel ini memandu Anda melakukan instalasi Ollama, memilih model terbaik untuk coding, hingga menghubungkannya langsung ke editor VS Code.

---

## 1. Memilih Model AI Khusus Coding yang Tepat

Sebelum mengunduh model, sesuaikan kapasitas VRAM kartu grafis (atau Unified Memory pada Apple Silicon) Anda:

| Model | Ukuran Parameter | Kebutuhan VRAM / RAM | Karakteristik Utama |
| :--- | :--- | :--- | :--- |
| **Qwen2.5-Coder** | 7B | 6 GB - 8 GB | Paling direkomendasikan untuk syntax multi-bahasa dan pengujian logika. |
| **DeepSeek-Coder-V2-Lite** | 16B (MoE) | 10 GB - 12 GB | Model Mixture-of-Experts dengan pemahaman arsitektur sistem yang dalam. |
| **Llama-3.1** | 8B | 6 GB - 8 GB | Handal untuk penalaran instruksi umum dan penyusunan dokumentasi teknis. |
| **Codestral** | 22B | 16 GB+ | Sangat akurat dalam melengkapi baris kode (*fill-in-the-middle*). |

Bagi pengguna laptop standar dengan RAM 16 GB atau GPU 8 GB, model kuantisasi 4-bit (`q4_K_M`) dari **Qwen2.5-Coder:7b** adalah titik awal paling ideal.

---

## 2. Instalasi Ollama di Sistem Operasi Anda

### Di Linux / WSL2:
Buka terminal dan jalankan script installer resmi:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Pastikan driver NVIDIA CUDA telah terpasang jika Anda menggunakan kartu grafis diskrit:

```bash
nvidia-smi
```

### Di macOS:
Unduh berkas instalasi `.dmg` dari situs resmi Ollama atau gunakan Homebrew:

```bash
brew install ollama
```

### Di Windows:
Gunakan installer berekstensi `.exe` dari halaman resmi Ollama. Ollama akan berjalan sebagai daemon di latar belakang pada port lokal `11434`.

---

## 3. Mengunduh dan Menguji Model Coding

Setelah instalasi selesai, unduh model pilihan Anda ke penyimpanan lokal:

```bash
ollama run qwen2.5-coder:7b
```

Ollama akan mengunduh bobot model (sekitar 4.7 GB). Begitu selesai, Anda langsung masuk ke sesi interaktif terminal. Coba berikan prompt teknikal:

```text
>>> Buatkan fungsi Go (Golang) untuk menghitung checksum SHA-256 dari berkas besar secara streaming tanpa memuat seluruh file ke memori.
```

Model akan menghasilkan kode Go idiomatis lengkap dengan penanganan error dalam hitungan detik, dieksekusi 100% secara lokal tanpa paket data keluar dari komputer Anda.

Untuk keluar dari CLI interaktif, ketik:
```text
>>> /bye
```

---

## 4. Konfigurasi Lingkungan Produksi dan Akses Jaringan

Secara default, Ollama hanya mendengarkan koneksi dari `localhost:11434`. Jika Anda ingin server Ollama di satu PC dapat diakses oleh laptop lain di jaringan lokal (LAN), ubah variabel lingkungan layanannya:

Pada sistem Linux (systemd):

```bash
sudo systemctl edit ollama.service
```

Tambahkan baris berikut di blok `[Service]`:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_KEEP_ALIVE=24h"
```

Simpan konfigurasi dan muat ulang layanan:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

Parameter `OLLAMA_KEEP_ALIVE=24h` memastikan model tetap dimuat di dalam memori VRAM GPU, sehingga Anda tidak perlu menunggu jeda pemuatan ulang (*cold start*) saat memanggil asisten di kemudian waktu.

---

## 5. Integrasi ke Editor VS Code via Ekstensi Continue

Untuk menjadikan Ollama asisten pair-programming mirip GitHub Copilot:

1. Buka VS Code dan pasang ekstensi **Continue** dari VS Code Marketplace.
2. Buka berkas konfigurasi Continue di `~/.continue/config.json`.
3. Tambahkan konfigurasi Ollama sebagai berikut:

```json
{
  "models": [
    {
      "title": "Local Qwen Coder 7B",
      "provider": "ollama",
      "model": "qwen2.5-coder:7b",
      "apiBase": "http://localhost:11434"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Tab Autocomplete",
    "provider": "ollama",
    "model": "qwen2.5-coder:1.5b",
    "apiBase": "http://localhost:11434"
  }
}
```

Model `qwen2.5-coder:1.5b` yang ringan sengaja dipilih untuk pelengkapan otomatis (*tab autocomplete*) karena latensinya di bawah 50ms, memberikan pengalaman mengetik yang sangat responsif.

---

## Kesimpulan

Menjalankan LLM secara lokal bukan lagi eksperimen rumit. Dengan Ollama, Anda memiliki kontrol penuh atas keamanan data, zero biaya langganan bulanan per token, dan fleksibilitas bekerja di mana saja bahkan saat bepergian tanpa akses internet.
