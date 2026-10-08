---
title: "Trik Mengatasi Context Rot dan Token Limit pada AI Builder: Seni Mengunci Kode dan Modularitas"
slug: "mengatasi-context-rot-token-limit-ai-builder-modularitas"
date: "2026-10-08"
author: "Wahid Alimudin"
category: "Teknologi & AI"
tags: ["Context Rot", "Token Limit", "AI App Builder", "Modularitas Kode", "Bolt.new", "Cursor"]
summary: "Strategi mengatasi penurunan performa AI (context rot) dan pemborosan token limit saat membangun aplikasi besar dengan AI builder melalui modularitas dan fitur file lock."
readingTime: "9 menit baca"
---

Pernahkah Anda mengalami situasi di mana aplikasi yang Anda bangun menggunakan AI builder berjalan sangat mulus pada satu jam pertama, namun ketika memasuki jam ketiga, AI mulai bertindak aneh? Kode yang sebelumnya berfungsi tiba-tiba terhapus, fitur login mendadak rusak saat Anda hanya meminta perubahan warna tombol, dan respon AI menjadi sangat lambat serta boros token kuota langganan Anda?

Fenomena ini dikenal di kalangan pengembang AI sebagai **Context Rot** (pembusukan konteks) dan degradasi jendela konteks (*Context Window Degradation*).

Setiap kali Anda mengirimkan prompt baru di platform seperti Bolt.new atau Lovable, sistem tidak hanya mengirim teks yang Anda ketik, melainkan seluruh riwayat obrolan terdahulu beserta puluhan file kode yang ada di proyek. Ketika ukuran konteks membengkak, perhatian model (*attention mechanism*) terpecah, memicu halusinasi dan kerusakan kode.

Berikut adalah teknik-teknik teruji untuk menjaga ketajaman AI builder pada proyek berskala besar.

---

## 1. Mekanisme Penyebab Context Rot pada AI Builder

Untuk mencegah masalah ini, Anda perlu memahami bagaimana konteks diproses di balik layar:

```text
[Prompt 1 - 5]: Konteks Bersih (10k Token)  ---> Respon Akurat & Cepat
                     |
[Prompt 15 - 25]: Riwayat Menumpuk (60k Token) ---> Mulai Lupa Variabel
                     |
[Prompt 40+]: Konteks Penuh (120k+ Token)  ---> CONTEXT ROT:
                                                - Hapus Kode Penting
                                                - Halusinasi Library Liar
                                                - Error Tidak Berkesudahan
```

Ketika jendela konteks dipenuhi oleh pesan error masa lalu dan kode usang yang sudah berkali-kali direvisi, model AI kesulitan membedakan mana versi kode yang sah dan mana yang sudah kedaluwarsa.

---

## 2. Empat Trik Mengatasi Context Rot

### Trik 1: Manfaatkan Fitur File Locking (Kunci File yang Stabil)
Platform modern seperti Bolt.new menyediakan fitur ikon gembok (*File Lock*). 
* Begitu sebuah modul (misalnya sistem Autentikasi atau Komponen Navbar) sudah berfungsi 100% tanpa cela, segera **kunci file tersebut**.
* Mengunci file memberi sinyal tegas kepada agen AI: *"File ini sudah final, jangan pernah mengubah atau menulis ulang file ini dalam situasi apa pun."* Ini mencegah AI merusak fitur stabil saat Anda memintanya mengerjakan halaman lain.

### Trik 2: Terapkan Arsitektur File Modular (Pecah File Raksasa)
Jangan biarkan AI menumpuk 800 baris kode dalam satu file `App.tsx` atau `Dashboard.tsx`. AI paling mudah melakukan halusinasi saat mengedit file raksasa.
* Batasi ukuran file maksimal 150 hingga 200 baris kode.
* Pecah antarmuka menjadi komponen mikro: `ProductCard.tsx`, `ProductGrid.tsx`, `FilterSidebar.tsx`, dan `ProductModal.tsx`.
* Dengan file berukuran kecil, AI hanya perlu memproses sedikit token saat melakukan perbaikan bug lokal.

### Trik 3: Teknik Reset Obrolan dengan Context Snapshot
Jika obrolan sudah melampaui 25 hingga 30 iterasi dan AI mulai tampak bingung, **jangan lanjutkan percakapan di utas obrolan tersebut!**
1. Buka branch baru atau commit perubahan terakhir ke GitHub.
2. Minta AI di akhir obrolan: *"Tuliskan ringkasan status proyek saat ini (arsitektur, fitur yang sudah selesai, dan fitur yang sedang dikerjakan) dalam 3 paragraf."*
3. Salin ringkasan tersebut, buat sesi percakapan baru (*New Chat*), lalu tempel ringkasan tersebut sebagai prompt awal.
4. Jendela konteks akan kembali bersih dan tajam seperti sedia kala tanpa kehilangan progres kode proyek.

### Trik 4: Isolasi State Global Menggunakan Zustand
Hindari melemparkan properti (*prop drilling*) melewati belasan level komponen bersarang. Gunakan Zustand atau Nanostores untuk mengelola state global.
* State yang terisolasi di file `useStore.ts` memungkinkan komponen lain membaca dan mengubah data tanpa harus saling terikat secara kaku.
* Ketika AI diminta memodifikasi satu komponen, ia tidak perlu menyentuh atau membongkar komponen induknya.

---

## 3. Checklist Menjaga Kesehatan Konteks Proyek

Sebelum mengirimkan prompt baru ke AI builder, lakukan audit cepat:
* [ ] Apakah file-file yang sudah stabil sudah dikunci (*locked*)?
* [ ] Apakah prompt ini hanya berfokus pada 1 tugas spesifik alih-alih meminta 5 fitur sekaligus?
* [ ] Apakah pesan error di console sudah dibersihkan sebelum menambah fitur baru?
* [ ] Apakah riwayat obrolan sudah terlalu panjang (>30 pesan)? Jika ya, buat utas baru.
