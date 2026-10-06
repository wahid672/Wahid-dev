---
title: "Tutorial Lengkap Remotion: Panduan Editing Video Berbasis Kode dari A Sampai Z untuk Orang Awam"
slug: "tutorial-lengkap-remotion-video-editing-react-pemula-a-sampai-z"
date: "2026-10-06"
author: "Wahid Alimudin"
category: "Content Creation"
tags: ["Remotion", "Video Editing", "Content Creation", "React", "Otomasi Video", "Tutorial Pemula"]
summary: "Panduan praktis belajar Remotion (kerap disebut Renotion) dari nol untuk orang awam. Cara membuat, mengedit, menganimasikan video secara terprogram menggunakan React, dan trik otomasi video massal dengan AI."
readingTime: "10 menit baca"
---

Dalam dunia kreasi konten dan pemasaran digital, video telah menjadi format media paling dominan. Namun, proses produksi video menggunakan perangkat lunak konvensional seperti Adobe Premiere Pro, DaVinci Resolve, atau Final Cut Pro sering kali menuntut spesifikasi komputer yang sangat berat, waktu rendering yang lama, dan pekerjaan manual yang berulang jika Anda harus memproduksi puluhan variasi video setiap harinya.

Kini muncul terobosan baru dalam dunia penyuntingan video yang sedang viral di kalangan kreator dan pengembang: **Remotion** (yang di internet dan komunitas sering salah ketik atau dicari dengan nama **Renotion**). Remotion adalah kerangka kerja berbasis web dan kode (React) yang memungkinkan Anda membuat video berkualitas tinggi, menganimasikan grafis, memasukkan audio, serta memproduksi video secara otomatis hanya dengan logika terprogram.

Bahkan jika Anda adalah orang awam yang belum pernah menulis kode pemrograman sebelumnya, panduan ini akan memandu Anda langkah demi langkah dari A sampai Z untuk memahami, menginstal, membuat video pertama, hingga memanfaatkan kecerdasan buatan (AI) untuk membuat video instan tanpa pusing.

---

## 1. Mengenal Remotion: Mengapa Disebut Revolusi Video Editing?

Remotion mengubah paradigma pengeditan video. Alih-alih menggeser klip dan keyframe secara manual di timeline grafis yang rumit, Anda memperlakukan video layaknya sebuah halaman web interaktif yang dirender bingkai demi bingkai (*frame by frame*) menjadi berkas MP4.

### Mengapa Sering Muncul Istilah "Renotion"?
Banyak pemula menyebutnya "Renotion" karena dua hal:
1. Salah dengar atau salah ketik dari nama aslinya, yaitu **Remotion**.
2. Remotion sangat populer dipadukan dengan **Notion**. Banyak kreator menyimpan naskah video, daftar kutipan, dan data produk di database Notion, lalu menggunakan Remotion untuk menyedot data tersebut dan mengubahnya menjadi ratusan video TikTok, Reels, atau Shorts secara otomatis. Belakangan, Notion AI juga memperkenalkan fitur eksekusi kode komputer yang mampu memanggil Remotion secara langsung.

### Perbandingan Video Editor Konvensional vs Remotion

| Fitur / Parameter | Video Editor Biasa (Premiere/CapCut) | Remotion (Code-Based Video) |
| :--- | :--- | :--- |
| **Metode Kerja** | Tarik dan lepas (*drag-and-drop*) manual | Terprogram menggunakan komponen teks & React |
| **Produksi Massal** | Harus mengedit satu per satu secara manual | Cukup 1 template, bisa menghasilkan ribuan video berbeda dari data Excel/Notion |
| **Konsistensi Brand** | Rawan bergeser atau beda ukuran font antar editor | Presisi 100% mengikuti aturan CSS dan desain sistem |
| **Integrasi AI** | Terbatas pada plugin tertentu | Sangat fleksibel digabungkan dengan ChatGPT, Claude, atau database Cloud |
| **Biaya Lisensi** | Berlangganan bulanan mahal | Gratis untuk perorangan dan tim kecil hingga 3 orang |

---

## 2. Persiapan Awal untuk Orang Awam (Hanya Butuh 2 Alat)

Jangan merasa takut ketika mendengar kata "coding". Menjalankan Remotion jauh lebih mudah daripada yang dibayangkan. Anda hanya memerlukan dua perangkat lunak gratis yang terpasang di komputer (Windows, Mac, atau Linux):

1. **Node.js (Mesin Eksekusi):**
   * Kunjungi situs resmi `nodejs.org`.
   * Unduh versi **LTS** (Recommended for Most Users).
   * Pasang di laptop Anda dengan mengklik *Next* hingga selesai.
2. **Visual Studio Code (Editor Teks Gratis):**
   * Kunjungi `code.visualstudio.com`.
   * Unduh dan pasang di komputer Anda. Ini adalah tempat Anda melihat berkas proyek dan mengedit teks video.

Setelah kedua alat ini terpasang, komputer Anda sudah 100% siap untuk memproduksi video berbasis kode.

---

## 3. Langkah Demi Langkah: Membuat Proyek Remotion Pertama

Mari kita mulai membuat proyek Remotion dari awal hanya dalam waktu kurang dari dua menit.

### Langkah 1: Buka Terminal
* Di Windows: Buka aplikasi **Command Prompt** (cmd) atau **PowerShell**.
* Di Mac / Linux: Buka aplikasi **Terminal**.
* Atau di dalam Visual Studio Code: Klik menu atas `Terminal` -> `New Terminal`.

### Langkah 2: Jalankan Perintah Pembuat Proyek
Ketik perintah resmi berikut dan tekan Enter:

```bash
npx create-video@latest
```

Sistem akan menanyakan beberapa pertanyaan sederhana:
1. *What would you like to name your video?* Ketik nama folder, misalnya: `video-pertama-saya`.
2. *Select a template:* Pilih **Blank** (kanvas kosong) atau **Hello World** (disertai contoh animasi dasar). Gunakan tombol panah pada keyboard untuk memilih, lalu tekan Enter.
3. *Select your preferred language:* Pilih **TypeScript** atau **JavaScript**.

Tunggu sekitar 30 hingga 60 detik hingga seluruh modul pendukung selesai diunduh secara otomatis.

### Langkah 3: Masuk ke Folder dan Jalankan Preview Studio
Ketik perintah berikut secara berurutan:

```bash
cd video-pertama-saya
npm run dev
```

Terminal akan menampilkan tautan lokal seperti `http://localhost:3000`. Buka browser Chrome atau Edge Anda dan buka alamat tersebut. 

Selamat! Anda kini melihat **Remotion Studio** di browser Anda. Tampilannya memiliki layar preview video, tombol play/pause, dan slider timeline frame persis seperti software video editor profesional.

---

## 4. Memahami 4 Konsep Dasar Remotion

Sebelum mengedit video, pahami 4 pilar sederhana bagaimana Remotion berpikir:

```text
[Root: Mendefinisikan Composition] 
         |
    [Composition: Ukuran 1080x1920, 30 FPS, Durasi 150 Frame]
         |
    [Sequence: Timeline Lapisan Teks, Audio, & Gambar]
         |
    [Animation: useCurrentFrame + spring() untuk Gerakan Halus]
```

1. **Composition (Komposisi):**
   Wadah utama video. Di sini Anda menentukan resolusi (misal `width={1080}` dan `height={1920}` untuk format portrait HP), frame rate (`fps={30}`), dan durasi total dalam satuan frame (`durationInFrames={150}` untuk 5 detik pada 30 fps).
2. **Sequence (Urutan / Timeline Layer):**
   Menentukan kapan suatu elemen mulai muncul dan berapa lama tampil di layar. Contoh: Anda ingin musik mulai dari detik ke-0, namun teks judul baru muncul di detik ke-2 (frame ke-60).
3. **useCurrentFrame:**
   Sebuah fungsi bantuan (*React Hook*) yang memberi tahu Anda video sedang berada di frame ke berapa saat ini. Ini adalah dasar dari semua animasi.
4. **spring & interpolate:**
   Alat bantu pembuat animasi instan. Anda tidak perlu menghitung rumus matematika yang rumit. `spring()` membuat efek membal alami (*bouncy*), sedangkan `interpolate()` mengubah nilai frame berjalan menjadi transparansi (opacity) atau posisi pergeseran teks.

---

## 5. Tutorial Praktik: Membuat Video Teks Beranimasi Pertama

Buka folder proyek Anda di VS Code. Anda akan melihat berkas utama bernama `src/Root.tsx` dan berkas komponen video di `src/Composition.tsx`.

Mari buat video vertikal (ukuran 1080x1920 untuk Instagram Reels atau TikTok) berdurasi 5 detik dengan animasi teks judul yang membal halus.

### Ubah Berkas `src/Root.tsx`:

```tsx
import { Composition } from 'remotion';
import { MyVideoComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="IklanPendek"
      component={MyVideoComposition}
      durationInFrames={150} // 150 frame dibagi 30 fps = 5 detik
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        titleText: "Selamat Datang di Remotion!",
        subtitleText: "Editing Video Otomatis Berbasis Kode"
      }}
    />
  );
};
```

### Ubah Berkas `src/Composition.tsx`:

```tsx
import { 
  AbsoluteFill, 
  interpolate, 
  spring, 
  useCurrentFrame, 
  useVideoConfig 
} from 'remotion';

interface VideoProps {
  titleText: string;
  subtitleText: string;
}

export const MyVideoComposition: React.FC<VideoProps> = ({ 
  titleText, 
  subtitleText 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animasi 1: Judul membal masuk dari atas menggunakan spring
  const titleScale = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  // Animasi 2: Teks subtitle muncul perlahan (fade-in) dari frame 20 sampai 45
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        padding: 60,
      }}
    >
      {/* Teks Judul Utama */}
      <h1
        style={{
          color: '#38bdf8',
          fontSize: 76,
          fontWeight: 800,
          textAlign: 'center',
          transform: `scale(${titleScale})`,
          marginBottom: 20,
        }}
      >
        {titleText}
      </h1>

      {/* Teks Subtitle */}
      <p
        style={{
          color: '#cbd5e1',
          fontSize: 40,
          textAlign: 'center',
          opacity: subtitleOpacity,
          maxWidth: 900,
          lineHeight: 1.4,
        }}
      >
        {subtitleText}
      </p>
    </AbsoluteFill>
  );
};
```

Buka kembali browser Anda pada `http://localhost:3000`. Tekan tombol spasi untuk memutar video. Anda akan melihat teks judul membal masuk dengan sangat halus dan teks penjelasan di bawahnya muncul secara elegan. Semua ini diatur murni melalui CSS dan React.

---

## 6. Cara Memasukkan Gambar, Video Latar, dan Musik

Sebuah video tentu tidak lengkap tanpa media visual dan audio latar belakang. Remotion menyediakan komponen bawaan yang sangat mudah digunakan: `<Img />`, `<Video />`, dan `<Audio />`.

1. **Letakkan File Media:**
   Masukkan berkas musik Anda (misal `musik.mp3`) dan logo/gambar (misal `logo.png`) ke dalam folder bernama `public/` di dalam proyek Anda.
2. **Gunakan di dalam Komposisi:**

```tsx
import { AbsoluteFill, Audio, Img, staticFile } from 'remotion';

export const VideoLengkap: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Musik Latar Belakang */}
      <Audio src={staticFile('musik.mp3')} volume={0.6} />

      {/* Gambar Logo di Pojok Atas */}
      <Img 
        src={staticFile('logo.png')} 
        style={{ width: 120, height: 120, position: 'absolute', top: 60, left: 60 }} 
      />
    </AbsoluteFill>
  );
};
```

Fungsi `staticFile()` memastikan berkas media lokal Anda dibaca dengan benar saat preview maupun saat rendering video final.

---

## 7. Cara Render Menjadi File Video MP4

Setelah Anda puas melihat pratinjau di browser, saatnya mengubah kode tersebut menjadi berkas video nyata berformat `.mp4` yang siap Anda unggah ke media sosial atau kirim ke klien.

Buka terminal di VS Code, lalu ketik perintah render berikut:

```bash
npx remotion render src/Root.tsx IklanPendek out/video-hasil.mp4
```

### Apa yang Terjadi di Balik Layar?
Remotion menggunakan browser headless Chromium dan pustaka multimedia FFmpeg untuk merender setiap frame dengan presisi tinggi, menggabungkan audio, dan mengompresnya menjadi berkas video MP4 H.264 standar industri.

Setelah proses render mencapai 100%, Anda dapat membuka folder `out/` di komputer Anda dan memutar file `video-hasil.mp4`. Kualitasnya jernih, tajam, dan bebas dari watermark pihak ketiga.

---

## 8. Trik Orang Awam: Membuat Video Tanpa Coding Menggunakan AI

Kelebihan terbesar Remotion dibandingkan software editing video lain adalah sifatnya yang berbasis teks kode. Karena berupa kode, model kecerdasan buatan seperti ChatGPT, Claude, atau GitHub Copilot dapat menuliskan seluruh kode video untuk Anda secara instan.

### Contoh Prompt AI yang Terbukti Ampuh:

> *"Saya sedang menggunakan Remotion dengan TypeScript. Buatkan saya komponen video ukuran 1080x1920 (durasi 10 detik, 30 fps) untuk konten edukasi fakta sains pendek. Komponen harus memiliki latar belakang gradien ungu gelap, teks nomor fakta yang membal masuk di detik ke-1, dan kotak fakta dengan teks beranimasi slide-in dari kiri di detik ke-2. Gunakan spring dan interpolate dari Remotion."*

AI akan langsung menghasilkan kode lengkap. Anda hanya perlu menyalin (*copy*) kode tersebut dan menempelkannya (*paste*) ke dalam berkas `Composition.tsx`. Tanpa perlu memikirkan sintaks yang rumit, video Anda sudah langsung jadi dan siap pakai.

---

## 9. Otomasi Video Massal dari Data Spreadsheet / Notion

Kekuatan magis Remotion yang sesungguhnya adalah kemampuannya memproduksi puluhan video berbeda secara serentak tanpa perlu mengedit timeline satu per satu.

Bayangkan Anda memiliki toko online dengan 50 produk berbeda. Anda ingin membuat 50 video promosi TikTok untuk setiap produk tersebut:
1. Buat 1 template video Remotion standar (ada tempat untuk nama produk, harga diskon, dan gambar produk).
2. Siapkan data produk Anda dalam bentuk berkas JSON atau hubungkan dengan database Notion / Google Sheets.
3. Jalankan skrip perulangan (*loop script*) sederhana di Node.js untuk merender 50 video secara otomatis.

Dalam waktu 15 menit, komputer Anda akan merender 50 video promosi yang unik dan rapi, menghemat puluhan jam kerja manual seorang video editor.

---

## 10. Checklist Praktis Memulai Remotion

Gunakan daftar periksa berikut setiap kali Anda memulai proyek video baru:

- [ ] Node.js versi LTS sudah terpasang di komputer.
- [ ] Proyek dibuat menggunakan perintah `npx create-video@latest`.
- [ ] Resolusi dan FPS sudah disesuaikan di `Root.tsx` (1080x1920 untuk HP, 1920x1080 untuk YouTube landscape).
- [ ] Berkas musik, gambar, dan video pendukung ditaruh di folder `public/` dan dipanggil dengan `staticFile()`.
- [ ] Durasi frame dihitung dengan benar: `Detik x FPS = Total Frames` (misal 10 detik x 30 fps = 300 frame).
- [ ] Preview dicek di browser dengan `npm run dev` sebelum proses render final dijalankan.
- [ ] Video dirender ke format MP4 dengan perintah `npx remotion render`.

Dengan memahami dasar-dasar Remotion, Anda kini memiliki keahlian mutakhir untuk memproduksi konten video modern secara otomatis, efisien, dan berskala besar.
