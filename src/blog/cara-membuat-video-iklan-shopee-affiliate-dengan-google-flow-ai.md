---
title: "Panduan Lengkap Mengubah URL Produk Shopee Affiliate Menjadi Video Iklan Menggunakan Google Flow AI"
slug: "cara-membuat-video-iklan-shopee-affiliate-dengan-google-flow-ai"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["Google Flow", "Shopee Affiliate", "Veo AI", "Video Iklan", "Otomasi", "Digital Marketing"]
summary: "Riset mendalam dan tutorial step by step mengubah link produk Shopee Affiliate menjadi video iklan sinematik viral menggunakan Google Flow dan engine video Veo AI."
readingTime: "8 menit baca"
---

Program Shopee Affiliate dan fitur Shopee Video saat ini menjadi salah satu saluran pendapatan pasif paling menjanjikan bagi kreator digital di Indonesia. Shopee memberikan prioritas jangkauan algoritma yang sangat masif bagi konten video pendek berformat vertikal yang menyematkan keranjang oranye, lengkap dengan insentif komisi ekstra dan voucher diskon gratis ongkir bagi pembeli.

Namun, kendala terbesar bagi affiliator pemula maupun profesional selalu berkutat pada dua hal: **modal membeli sampel produk fisik** dan **waktu syuting manual yang melelahkan**. Membeli 30 barang berbeda setiap bulan menguras modal jutaan rupiah, belum lagi proses unboxing, menata pencahayaan ruangan, dan pengeditan video yang memakan waktu berjam-jam.

Hadirnya **Google Flow**, studio kreatif AI pembuatan film terintegrasi dari Google Labs, membuka terobosan baru. Dengan memanfaatkan perpaduan model kecerdasan buatan kelas dunia seperti **Google Veo 3.1** untuk generasi video sinematik, **Imagen 3** untuk aset visual, dan **Gemini** sebagai sutradara naskah cerdas, Anda dapat mengubah URL produk Shopee Affiliate menjadi video iklan komersial berkualitas tinggi tanpa perlu menyentuh produk fisik sama sekali.

Artikel ini menyajikan riset mendalam serta panduan teknis langkah demi langkah untuk membangun mesin produksi video iklan Shopee Affiliate otomatis menggunakan ekosistem Google Flow.

---

## 1. Membedah Ekosistem Google Flow AI untuk Iklan Video

Google Flow (`labs.google/flow`) bukan sekadar generator teks-ke-video sederhana. Platform ini dirancang sebagai studio penyutradaraan digital (*AI Filmmaking Studio*) yang mengintegrasikan tiga model AI mutakhir dari Google:

1. **Google Gemini (Intelligence & Directing Layer):** Bertindak sebagai periset produk dan penulis skenario. Gemini memindai URL produk, menganalisis ulasan pelanggan, mengidentifikasi keunggulan utama (*Unique Selling Proposition / USP*), dan menyusun storyboard adegan per adegan.
2. **Google Imagen 3 (Visual Asset Generator):** Menghasilkan gambar referensi produk dan karakter model virtual dengan konsistensi wajah, pakaian, dan lingkungan (*character consistency*).
3. **Google Veo 3.1 (Cinematic Video Engine):** Model pembuat video generasi tercanggih dari Google DeepMind yang memiliki pemahaman mendalam terhadap fisika dunia nyata (tetesan air, pantulan cahaya, lipatan kain) serta kontrol kamera sinematik yang presisi.

---

## 2. Langkah 1: Riset dan Ekstraksi Data URL Produk Shopee

Langkah awal dimulai dari memilih produk Shopee yang memiliki potensi konversi tinggi:

1. Buka aplikasi Shopee, masuk ke **Shopee Affiliate Program -> Komisi Ekstra**.
2. Pilih produk dari toko **Shopee Mall** atau **Star+** dengan kriteria:
   - Rating ulasan minimal 4.8 bintang.
   - Terjual minimal 1.000 pesanan.
   - Komisi affiliator di kisaran 10% hingga 25%.
   - Kategori produk dengan daya tarik visual tinggi (misal: botol pembersih serbaguna, lampu meja ambient, alat pijat leher, atau serum wajah).
3. Salin tautan produk Shopee tersebut (*Share -> Salin Tautan*).
4. Unduh 2 hingga 3 foto ulasan pembeli beresolusi tinggi dari kolom review Shopee yang memperlihatkan fisik barang asli secara jelas.

---

## 3. Langkah 2: Menggunakan Gemini untuk Merumuskan Storyboard Iklan

Buka Gemini (atau panel arahan di Google Flow) dan berikan URL produk beserta instruksi penyusunan storyboard:

```text
Bertindaklah sebagai Creative Director video iklan Shopee Video profesional.
Berikut adalah informasi produk dari URL Shopee:
- Produk: [NAMA PRODUK, contoh: Diffuser Humidifier Api Mini Portable]
- Fitur Utama: Menghasilkan uap dengan efek api LED hangat, kapasitas 200ml, super hening, mati otomatis saat air habis.
- Masalah Pengguna: Kamar tidur pengap, sulit tidur nyenyak, dan ruangan berbau apek.

Tolong buatkan naskah video iklan vertikal (9:16) berdurasi 25 detik yang terbagi menjadi 4 adegan terstruktur:
1. Adegan 1 (0-3s, Hook): Seseorang menatap kamar tidur yang gelap dengan ekspresi lelah dan gelisah.
2. Adegan 2 (3-10s, Unboxing/Reveal): Tangan mengeluarkan diffuser estetik dari kotak kemasan di atas meja kayu.
3. Adegan 3 (10-18s, Demo/Action): Diffuser dinyalakan, uap air beraroma wangi mengepul lembut dengan pencahayaan LED oranye menyerupai nyala api yang tenang.
4. Adegan 4 (18-25s, CTA): Kamera bergerak mundur memperlihatkan suasana kamar tidur yang tenang dan nyaman, disertai ajakan checkout di keranjang oranye.

Sertakan deskripsi visual rinci (prompt visual) dalam bahasa Inggris untuk dimasukkan ke mesin video Veo 3.1 Google Flow.
```

Gemini akan mengurai naskah narasi persuasif dalam bahasa Indonesia sekaligus memberikan instruksi prompt visual kamera sinematik untuk setiap adegan.

---

## 4. Langkah 3: Mengembangkan Video Sinematik di Google Flow (Veo 3.1)

Buka ruang kerja Google Flow di peramban Anda:

### 1. Pengaturan Kanvas & Parameter
- Buat proyek baru (*New Project*).
- Pilih rasio aspek video **9:16 (Vertical Fullscreen)** yang merupakan standar mutlak Shopee Video dan TikTok.
- Aktifkan engine render **Veo 3.1**.

### 2. Memasukkan Gambar Referensi Produk (In-Context Conditioning)
Agar bentuk produk di dalam video 100% konsisten dengan produk asli yang dijual di Shopee:
- Gunakan fitur **Image-to-Video** pada klip kedua dan ketiga.
- Unggah foto produk Shopee yang telah Anda unduh sebagai gambar acuan (*Reference Frame*).
- Atur parameter konsistensi subjek (*Subject Fidelity*) di angka 75%. Hal ini menjaga agar logo, warna, dan proporsi produk tidak mengalami distorsi saat kamera bergerak.

### 3. Eksekusi Prompt Adegan Sinematik
Salin prompt bahasa Inggris yang telah dirumuskan Gemini ke kolom prompt Google Flow:

#### Prompt Adegan 1 (Hook Visual):
```text
Cinematic close-up of a tired young person sitting on a cozy bed in a dim bedroom, moody blue ambient lighting, rubbing their temples, looking stressed and restless. Subtle handheld camera motion, 4k photorealistic, commercial aesthetic.
```

#### Prompt Adegan 2 (Product Hero Shot):
```text
Using the uploaded reference image of the flame diffuser, elegant macro shot of hands unboxing the sleek minimalist black diffuser on a warm oak wooden table. Soft studio rim lighting, cinematic slow pan camera movement.
```

#### Prompt Adegan 3 (Feature Demonstration):
```text
The mini diffuser sitting on a nightstand, glowing with realistic warm orange flame LED mist rising gracefully in super slow motion. Cozy dark bedroom background, soothing aromatherapy atmosphere, cinematic shallow depth of field, 60fps smooth render.
```

Tekan tombol **Generate**. Dalam beberapa saat, Veo 3.1 akan merender klip-klip video berkualitas komersial dengan transisi pergerakan kamera halus yang sulit dibedakan dari rekaman kamera studio asli.

---

## 5. Langkah 4: Penyuntingan Akhir di CapCut (Voiceover & Subtitle)

Setelah mengunduh klip-klip hasil generasi dari Google Flow, satukan materi video di aplikasi CapCut:

1. **Susun Urutan Timeline:** Gabungkan adegan 1 hingga adegan 4 secara berkesinambungan dengan total durasi 25 hingga 30 detik.
2. **Tambahkan Voiceover Emosional:** Rekam narasi suara Anda sendiri atau gunakan audio AI bernada antusias dari ElevenLabs/CapCut Text-to-Speech bahasa Indonesia.
3. **Auto Captions Dinamis:** Aktifkan subtitle otomatis dengan font tebal bergaris tepi hitam, dan beri warna kuning mencolok pada kata kunci promo (*"Voucher 50%"*, *"Cuma 60 Ribuan"*, *"Keranjang Oranye"*).
4. **Sisipkan Tombol Penunjuk Arah:** Tambahkan stiker panah bergerak yang mengarah ke sudut kiri bawah layar dengan teks: *"Beli di Keranjang Oranye Sekarang!"*.
5. **Tambahkan Musik Latar Tren:** Gunakan musik santai akustik atau lo-fi beat dengan volume rendah (sekitar 10%) agar suara narasi tetap terdengar lantang dan jelas.

---

## 6. Langkah 5: Penerbitan dan Kepatuhan Aturan Shopee Video

Saat mengunggah video ke Shopee Video:

### 1. Wajib Mengaktifkan Label Konten AI
Shopee memiliki regulasi ketat mengenai konten yang dihasilkan oleh perangkat lunak AI. Sebelum menekan tombol posting:
- Buka pengaturan lanjutan dan aktifkan toggle **"Konten Dihasilkan oleh AI"** (atau sertakan tagar `#KontenAI` di deskripsi).
- Memberikan label resmi ini **tidak akan mengurangi jangkauan penonton Anda**. Justru sebaliknya, akun Anda terlindungi dari pemblokiran moderasi otomatis Shopee.

### 2. Tautkan Produk Afiliasi Resmi
- Klik tombol **Tambah Produk**, cari produk yang sama persis dari toko terpercaya, lalu sematkan keranjang belanja.
- Pastikan harga pada produk yang ditautkan sesuai dengan klaim harga yang disebutkan dalam video agar tidak mengecewakan calon pembeli.

### 3. Waktu Posting Optimal (Golden Hours)
Unggah konten pada jam-jam puncak konversi belanja di Shopee:
- **Siang Hari:** Pukul 12.00 - 13.00 WIB (jam istirahat kerja/sekolah).
- **Malam Hari:** Pukul 19.30 - 21.30 WIB (jam santai menjelang tidur saat pengguna gemar scroll konten belanja).

---

## 7. Kalkulasi Potensi Penghasilan (Skema Cuan)

Mari hitung potensi pendapatan secara realistis:
- Rata-rata komisi produk: **Rp 15.000 per transaksi**.
- Dengan Google Flow, Anda dapat memproduksi **3 video iklan per hari** (total 90 video per bulan).
- Dari 90 video, asumsikan hanya **5 video** yang viral dan masing-masing menghasilkan 40 penjualan:
$$\text{Total Transaksi} = 5 \times 40 = 200 \text{ transaksi}$$
$$\text{Pendapatan Komisi Bersih} = 200 \times \text{Rp } 15.000 = \text{Rp } 3.000.000 / \text{bulan}$$

Seluruh penghasilan tersebut diraih tanpa modal membeli sampel barang fisik, tanpa biaya sewa studio, dan dapat dikerjakan sepenuhnya secara fleksibel dari rumah.

---

## Kesimpulan

Google Flow yang didukung oleh kekuatan video engine Veo 3.1 dan penalaran Gemini telah merevolusi efisiensi pembuatan materi iklan e-commerce. Dengan menggabungkan URL produk Shopee Affiliate, arahan storyboard yang tepat, dan sentuhan editing lokal yang persuasif, Anda memiliki sistem autopilot penghasil cuan yang siap bersaing di era digital modern.
