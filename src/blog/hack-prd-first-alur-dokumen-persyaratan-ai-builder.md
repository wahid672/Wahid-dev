---
title: "Hack PRD-First: Cara Membuat Product Requirement Document dengan Claude 3.5 Sebelum Masuk ke AI Builder"
slug: "hack-prd-first-alur-dokumen-persyaratan-ai-builder"
date: "2026-10-08"
author: "Wahid Alimudin"
category: "Teknologi & AI"
tags: ["PRD AI", "Claude 3.5 Sonnet", "Product Requirement Document", "Vibe Coding", "Lovable", "Bolt.new"]
summary: "Panduan praktis membuat PRD komprehensif menggunakan Claude 3.5 Sonnet untuk memandu AI builder agar terhindar dari feature creep, halusinasi kode, dan pemborosan token."
readingTime: "9 menit baca"
---

Kesalahan paling fatal yang dilakukan oleh pembuat aplikasi pemula di era *vibe coding* adalah langsung membuka platform AI builder seperti Lovable, Bolt.new, atau Replit Agent saat ide baru saja terlintas di kepala. Mereka langsung mengetik prompt di jendela chat tanpa rancangan yang matang.

Ketika aplikasi mulai bertambah kompleks di prompt ke-10, AI mulai mengalami amnesia: fitur yang sebelumnya sudah berfungsi mendadak hilang, skema data dirombak tanpa izin, dan tata letak halaman berubah drastis. Fenomena ini disebut sebagai **Context Drift** dan **Feature Creep**.

Para insinyur perangkat lunak senior yang menggunakan AI builder menerapkan trik rahasia: **PRD-First Workflow**. Sebelum menyentuh satu baris kode pun di AI builder, mereka menggunakan model penalaran tinggi seperti Claude 3.5 Sonnet untuk menyusun dokumen persyaratan produk (*Product Requirement Document* / PRD) yang sangat presisi.

---

## 1. Mengapa PRD Adalah Kompas Utama AI Coding Agent?

AI builder tidak memiliki memori jangka panjang tak terbatas. Dalam setiap siklus generasi kode, model AI membaca riwayat percakapan dan file proyek yang ada:

```text
[Ide Mentah di Kepala]
          |
    (Tanpa PRD)                      (Dengan PRD-First)
          v                                  v
+-----------------------+          +-----------------------+
| Buka AI Builder       |          | Susun PRD di Claude   |
| Prompt Acak & Trial   |          | Validasi Alur & Data  |
| Terjadi Context Drift |          | Eksekusi Bertahap     |
| HASIL: Proyek Macet   |          | HASIL: 100% Sesuai Rencana|
+-----------------------+          +-----------------------+
```

Dengan menyediakan dokumen PRD sebagai berkas referensi utama (misalnya disimpan sebagai file `PRD.md` di dalam repositori), AI builder memiliki panduan tunggal yang tidak terbantahkan. Jika terjadi perselisihan logika, Anda cukup menginstruksikan: *"Lihat kembali aturan di PRD.md Bagian 3, kembalikan alur sesuai dokumen tersebut."*

---

## 2. Meta-Prompt Claude 3.5 Sonnet untuk Menghasilkan PRD Siap Eksekusi

Buka obrolan baru di Claude 3.5 Sonnet, lalu berikan meta-prompt arsitektur berikut:

```markdown
Anda adalah Lead Product Manager dan Principal Software Architect. Saya ingin membangun aplikasi web dengan ide dasar berikut:
"[Tuliskan ide aplikasi Anda secara singkat di sini, misal: Platform pembuat faktur tagihan instan untuk freelancer]"

Tolong susun Product Requirement Document (PRD) yang sangat rinci dalam format Markdown dengan struktur:
1. Executive Summary & Masalah yang Diselesaikan
2. Target Pengguna & 3 User Persona Utama
3. Scope MVP (Daftar Fitur Wajib vs Fitur yang Dilarang Ada di Versi 1)
4. User Flow Langkah demi Langkah (Mulai dari onboarding hingga output selesai)
5. Data Architecture (Tabel entitas, tipe kolom, dan relasi one-to-many)
6. UI/UX Hierarchy (Daftar halaman, komponen kunci per halaman, responsive breakpoint)
7. Edge Cases & Penanganan Kesalahan (Network offline, validasi input kosong, format salah)
8. Checklist Verifikasi Kelulusan MVP

Gunakan bahasa yang teknis, padat, tanpa basa-basi, dan siap disuapkan ke AI app builder seperti Lovable atau Bolt.new.
```

---

## 3. Komponen Krusial yang Wajib Ada di PRD untuk AI Builder

Ada tiga bagian dalam dokumen PRD yang paling menentukan keberhasilan AI builder:

### A. Non-Goals (Fitur yang Dilarang Dibuat)
AI memiliki kecenderungan alami untuk menambahkan fitur ekstra yang tidak diminta. Menyebutkan batasan negatif secara tegas akan menghemat ribuan token dan mencegah bug:
* **Contoh:** *"NON-GOALS untuk Versi 1: Jangan buat sistem multi-bahasa, jangan buat sistem langganan bulanan Stripe, dan jangan buat integrasi sosial media. Fokus hanya pada kalkulasi dan cetak PDF lokal."*

### B. User Flow Bertahap
Jelaskan alur perjalanan pengguna secara linear:
* Step 1: Pengguna mengisi identitas profil bisnis.
* Step 2: Pengguna menambahkan item produk dengan harga dan kuantitas.
* Step 3: Sistem menghitung total, diskon persen, dan pajak secara otomatis.
* Step 4: Pengguna melihat pratinjau live sebelum mengunduh format PDF.

### C. Skema Data Terstandar
Tuliskan contoh struktur JSON atau tipe TypeScript untuk setiap entitas data agar AI tidak mengubah nama kunci variabel secara acak antar-halaman.

---

## 4. Cara Menggunakan PRD di Dalam AI Builder (Bolt.new / Lovable)

Begitu Claude menghasilkan dokumen `PRD.md`, jangan masukkan seluruh isi PRD dalam satu prompt raksasa! Terapkan teknik **Chunking Execution**:

1. **Inisialisasi Proyek:** Unggah atau tempel `PRD.md` ke dalam root direktori proyek, lalu perintahkan AI: *"Baca PRD.md. Siapkan tata letak dasar, tema warna, dan routing halaman sesuai Bagian 6."*
2. **Eksekusi Fitur per Fase:** Buka modul berikutnya: *"Sekarang fokus implementasikan Fitur 1 (Formulir Faktur) sesuai Bagian 4 dan 5 di PRD.md. Jangan sentuh modul lain."*
3. **Audit Kepatuhan:** Setelah modul selesai, tanyakan: *"Bandingkan implementasi saat ini dengan checklist di PRD.md Bagian 8. Fitur mana yang belum terpenuhi?"*

Dengan alur PRD-First ini, Anda memegang kendali penuh atas arsitektur perangkat lunak Anda, sementara AI bekerja secara disiplin layaknya developer junior yang patuh pada arahan manajer produk.
