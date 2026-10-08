---
title: "Database Schema-First Hack: Kuasai Integrasi Supabase dan PostgreSQL di Lovable dan Bolt.new"
slug: "database-schema-first-hack-supabase-postgresql-ai-builder"
date: "2026-10-08"
author: "Wahid Alimudin"
category: "Teknologi & AI"
tags: ["Supabase", "PostgreSQL", "Database Schema", "Lovable", "Bolt.new", "Row Level Security"]
summary: "Panduan arsitektur database schema-first untuk aplikasi AI builder, cara integrasi Supabase PostgreSQL, pembuatan ERD, dan penerapan Row Level Security (RLS) anti bocor."
readingTime: "10 menit baca"
---

Banyak aplikasi yang dibuat dengan AI builder terlihat sangat memukau di layar pratinjau browser, namun begitu dihubungkan dengan database riil, sistem langsung runtuh: data pengguna tertukar, query lambat, relasi tabel rusak, atau yang paling parah, database bocor ke publik karena ketiadaan hak akses.

Penyebab utamanya adalah kebiasaan membangun antarmuka pengguna (UI) terlebih dahulu sebelum memikirkan bagaimana data disimpan. Ketika AI builder dipaksa menghubungkan tombol frontend ke database secara terburu-buru, model sering mengarang nama tabel dan kolom secara sembarangan di berbagai file komponen.

Para developer profesional menggunakan strategi **Database Schema-First**: mendesain dan mengunci skema PostgreSQL di Supabase sebelum membiarkan AI menulis satu baris pun kode tampilan antarmuka.

---

## 1. Mengapa Supabase Adalah Pasangan Ideal AI Builder?

Platform seperti Lovable.dev dan Bolt.new memiliki integrasi bawaan (*native integration*) yang sangat kuat dengan Supabase. Supabase menyediakan PostgreSQL kelas enterprise lengkap dengan autentikasi instan, API REST otomatis, langganan data real-time, dan fungsi serverless (*Edge Functions*).

```text
+--------------------------------------------------------------+
|             ALUR ARSITEKTUR SCHEMA-FIRST DI SUPABASE         |
+--------------------------------------------------------------+
| 1. Desain Skema ERD & Tipe Relasi (SQL Migration File)       |
| 2. Pasang Kebijakan Row Level Security (RLS) di Setiap Tabel |
| 3. Hubungkan AI Builder ke Supabase Project                  |
| 4. Generate TypeScript Types Otomatis (Supabase CLI)         |
| 5. Instruksikan AI Membangun UI Mengikuti Tipe Tersebut      |
+--------------------------------------------------------------+
```

Dengan mengunci struktur tabel terlebih dahulu, AI builder tidak perlu menebak tipe data kolom atau membuat relasi data liar di dalam kode React.

---

## 2. Contoh Eksekusi Skema SQL yang Solid

Sebelum meminta AI builder membuat fitur, buka SQL Editor di dashboard Supabase Anda atau minta AI builder mengeksekusi skrip migrasi SQL terstruktur seperti di bawah ini:

```sql
-- 1. Buat Tabel Profil Pengguna (Menempel pada auth.users bawaan Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat Tabel Proyek Kerja
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. AKTIFKAN ROW LEVEL SECURITY (WAJIB UNTUK KEAMANAN)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. Buat Kebijakan RLS (Pengguna Hanya Boleh Akses Datanya Sendiri)
CREATE POLICY "Pengguna hanya bisa melihat profil sendiri" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Pengguna hanya bisa mengelola proyek miliknya" 
ON public.projects FOR ALL 
USING (auth.uid() = user_id);
```

---

## 3. Trik Melatih AI Builder Mematuhi Skema Database

Setelah tabel terpasang di Supabase, Anda dapat menerapkan trik prompt berikut ke dalam jendela obrolan AI builder:

```markdown
Koneksi ke Supabase telah aktif. Jangan buat tabel baru atau mengubah skema yang ada. 
Berikut adalah skema tabel resmi yang harus Anda patuhi:

- public.profiles (id, full_name, avatar_url, role, created_at)
- public.projects (id, user_id, title, description, status, created_at)

Instruksi Pengerjaan:
1. Gunakan library @supabase/supabase-js yang sudah terpasang.
2. Setiap query penambahan proyek baru wajib menyertakan user_id dari sesi pengguna yang aktif (auth.uid()).
3. Tangani pesan error dari Supabase (misalnya jika RLS menolak akses atau sesi login habis) dengan menampilkan toast notifikasi yang informatif.
```

Dengan cara ini, AI builder tidak akan melakukan halusinasi nama kolom seperti menggunakan `userId` di satu file dan `user_id` di file lain.

---

## 4. Tiga Jebakan Supabase yang Sering Dilakukan Pemula di AI Builder

1. **Lupa Mengaktifkan Row Level Security (RLS):** Jika RLS tidak diaktifkan pada tabel PostgreSQL, siapa pun yang mengetahui URL Supabase dan public anon key Anda dapat membaca atau menghapus seluruh data pengguna dari browser console.
2. **Menyimpan Secret Key di Frontend:** Jangan pernah membiarkan AI memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke dalam file `.env` yang dibaca oleh bundler frontend Vite/Next.js. Service role key memiliki hak penuh melewati semua aturan RLS!
3. **Tidak Menangani Auth State Change:** Pastikan AI builder memasang pendengar (*listener*) `supabase.auth.onAuthStateChange` di level root aplikasi agar status login pengguna tidak hilang saat halaman di-refresh.
