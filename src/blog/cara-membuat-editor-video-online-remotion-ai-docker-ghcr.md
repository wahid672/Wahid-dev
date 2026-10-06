---
title: "Cara Membuat Editor Video Online Berbasis Remotion dan AI dengan Docker Compose dan GHCR"
slug: "cara-membuat-editor-video-online-remotion-ai-docker-ghcr"
date: "2026-10-06"
author: "Wahid Alimudin"
category: "Web Development"
tags: ["Remotion", "Docker", "OpenAI", "Editor Video", "GHCR", "Full-Stack"]
summary: "Panduan lengkap merancang aplikasi web video editor interaktif berbasis Remotion dan AI, dipaketkan dalam container Docker GHCR, login aman via docker-compose, dan mendukung endpoint OpenAI universal."
readingTime: "11 menit baca"
---

Membangun editor video berbasis web tradisional biasanya membutuhkan keahlian rekayasa perangkat lunak grafis tingkat tinggi seperti WebGL, WebCodecs, dan manipulasi kanvas tingkat rendah (*low-level canvas*). Namun, dengan kehadiran **Remotion**, pengembang web modern kini dapat memanfaatkan kekuatan ekosistem React, HTML, dan CSS untuk memanipulasi video layaknya merancang halaman antarmuka web biasa.

Tantangan terbesar muncul ketika aplikasi editor video ini ingin dibagikan kepada pengguna awam atau tim non-teknis. Menginstruksikan orang awam untuk memasang Node.js, mengonfigurasi Chromium headless, mengompilasi FFmpeg, serta mengatur kunci rahasia (*environment variables*) di terminal lokal sering kali berujung pada kegagalan konfigurasi lingkungan (*environment mismatch*).

Solusi paling elegan dan ramah pengguna adalah mengemas seluruh sistem editor video Remotion yang ditenagai oleh kecerdasan buatan (AI) ke dalam **Docker Container** yang dipublikasikan di **GitHub Container Registry (GHCR)**. Pengguna awam hanya perlu menjalankan satu berkas konfigurasi `docker-compose.yml` tanpa perlu menginstal dependensi apapun di komputer mereka.

Artikel ini membedah arsitektur lengkap, kode implementasi, sistem login terisolasi, integrasi endpoint AI universal, hingga alur rilis container siap pakai.

---

## 1. Arsitektur Sistem: Video Editor Web + AI + Docker

Aplikasi ini dirancang dengan prinsip kesederhanaan operasional (*zero-setup for end-users*). Seluruh komponen terpadu ke dalam satu arsitektur terintegrasi:

```text
[Browser User: Antarmuka Web Ringan]
      |
      +---> [1. Login Password dari docker-compose.yml]
      |
      +---> [2. Input Prompt AI + Setting Endpoint & API Key]
      |
      +---> [3. Pratinjau Realtime: Remotion Player]
      |
      v
[Backend Container di Docker (Node.js + Chromium + FFmpeg)]
      |
      +---> [Render Headless via @remotion/renderer]
      |
      v
[Berkas Unduhan Video Final (.mp4)]
```

### Keunggulan Utama Arsitektur Ini:
1. **Antarmuka Web Visual:** Menggunakan `@remotion/player` sehingga pengguna dapat memutar, menjeda (*pause*), dan menggeser timeline video langsung di browser.
2. **AI Copilot Fleksibel (OpenAI-Compatible):** Pengguna dapat memasukkan endpoint AI pilihan mereka sendiri (OpenAI resmi, OpenRouter, Groq, DeepSeek, atau bahkan model lokal seperti Ollama) beserta API Key dan nama model.
3. **Autentikasi Bebas Database:** Pengguna login pertama kali menggunakan kata sandi yang didefinisikan secara transparan di variabel lingkungan `ADMIN_PASSWORD` pada `docker-compose.yml`.
4. **Portabilitas Penuh:** Image container ditarik langsung dari GitHub Container Registry (`ghcr.io`), memastikan versi aplikasi selalu konsisten dan siap jalan di sistem operasi apa pun.

---

## 2. Struktur Proyek dan Desain Skema Komposisi Video

Agar AI dapat menghasilkan video secara otomatis, aplikasi membutuhkan sebuah skema data terstruktur (*Scene Schema*) yang dapat diterjemahkan menjadi komponen Remotion secara dinamis.

### Struktur Direktori Proyek:

```text
remotion-ai-editor/
├── .github/
│   └── workflows/
│       └── docker-publish.yml     # CI/CD otomatis ke GHCR
├── public/                        # Aset font, audio, dan gambar
├── src/
│   ├── app/                       # Rute aplikasi Next.js / Express
│   │   ├── api/
│   │   │   ├── auth/route.ts      # Verifikasi password admin
│   │   │   ├── ai/generate/route.ts # Proxy pembuat skrip video
│   │   │   └── render/route.ts    # Pemicu render FFmpeg
│   │   ├── layout.tsx
│   │   └── page.tsx               # Halaman studio editor visual
│   ├── remotion/
│   │   ├── Composition.tsx        # Template perender video dinamis
│   │   └── types.ts               # Definisi skema video
├── Dockerfile                     # Multi-stage build dengan Chromium & FFmpeg
├── docker-compose.yml             # Konfigurasi deployment pengguna awam
└── package.json
```

### Definisi Skema JSON Video (`src/remotion/types.ts`):

```typescript
export interface VideoSlide {
  id: string;
  durationInFrames: number;
  backgroundColor: string;
  headline: string;
  subtext: string;
  textColor: string;
  accentColor: string;
  animationType: 'fade' | 'slide-left' | 'bounce';
}

export interface VideoProjectData {
  fps: number;
  width: number;
  height: number;
  slides: VideoSlide[];
}
```

---

## 3. Komponen Perender Dinamis Remotion (`src/remotion/Composition.tsx`)

Komponen ini menerima data dari skema di atas dan merendernya menjadi urutan bingkai visual:

```tsx
import React from 'react';
import { 
  AbsoluteFill, 
  Sequence, 
  interpolate, 
  spring, 
  useCurrentFrame, 
  useVideoConfig 
} from 'remotion';
import { VideoProjectData, VideoSlide } from './types';

const SlideItem: React.FC<{ slide: VideoSlide }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animasi judul membal halus
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 }
  });

  // Animasi transparansi subtext
  const opacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: slide.backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <h1
        style={{
          color: slide.textColor,
          fontSize: 80,
          fontWeight: 900,
          textAlign: 'center',
          transform: `scale(${scale})`,
          marginBottom: 24,
          lineHeight: 1.1
        }}
      >
        {slide.headline}
      </h1>
      <p
        style={{
          color: slide.accentColor,
          fontSize: 44,
          textAlign: 'center',
          opacity,
          maxWidth: 900,
          lineHeight: 1.4
        }}
      >
        {slide.subtext}
      </p>
    </AbsoluteFill>
  );
};

export const MainVideoComposition: React.FC<{ data: VideoProjectData }> = ({ data }) => {
  let accumulatedFrames = 0;

  return (
    <AbsoluteFill>
      {data.slides.map((slide) => {
        const fromFrame = accumulatedFrames;
        accumulatedFrames += slide.durationInFrames;

        return (
          <Sequence
            key={slide.id}
            from={fromFrame}
            durationInFrames={slide.durationInFrames}
          >
            <SlideItem slide={slide} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
```

---

## 4. Mekanisme AI Universal yang Mendukung Segala Penyedia OpenAI-Compatible

Alih-alih mengunci pengguna pada satu penyedia AI, backend menyediakan satu rute proxy yang meneruskan prompt ke endpoint mana pun yang mematuhi standar format API OpenAI.

### Rute Backend Generator Video AI (`src/app/api/ai/generate/route.ts`):

```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, endpoint, apiKey, model } = await req.json();

    // Default ke endpoint resmi OpenAI jika dikosongkan pengguna
    const targetEndpoint = (endpoint?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const targetModel = model?.trim() || 'gpt-4o-mini';

    const systemPrompt = `
Anda adalah direktur kreatif video profesional. Tugas Anda adalah mengubah ide pengguna menjadi struktur video Remotion dalam format JSON murni.
Format respons HARUS berupa objek JSON valid tanpa markdown tambahan:
{
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "slides": [
    {
      "id": "1",
      "durationInFrames": 90,
      "backgroundColor": "#0f172a",
      "headline": "Teks Judul",
      "subtext": "Penjelasan singkat",
      "textColor": "#38bdf8",
      "accentColor": "#cbd5e1",
      "animationType": "bounce"
    }
  ]
}
Total durasi video antara 150 hingga 300 frame (5 sampai 10 detik).
    `.trim();

    const response = await fetch(`${targetEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `AI Gateway Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const projectSchema = JSON.parse(rawContent);

    return NextResponse.json(projectSchema);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memproses AI' }, { status: 500 });
  }
}
```

Dengan desain ini, pengguna dapat dengan bebas beralih antara:
* **OpenRouter:** Mengakses ratusan model gratis dan murah (`https://openrouter.ai/api/v1`).
* **DeepSeek:** Menggunakan model DeepSeek V3 dengan biaya ultra-murah (`https://api.deepseek.com/v1`).
* **Groq:** Kecepatan kilat di bawah 1 detik menggunakan model Llama-3.3-70b (`https://api.groq.com/openai/v1`).
* **Ollama Lokal:** Sepenuhnya offline dan gratis di server pribadi (`http://host.docker.internal:11434/v1`).

---

## 5. Sistem Autentikasi Password Sederhana Tanpa Database

Untuk mencegah orang asing mengakses editor video Anda di server publik, kita mengimplementasikan verifikasi kata sandi langsung terhadap variabel lingkungan yang diberikan di `docker-compose.yml`.

### Verifikasi Sesi Ringan (`src/app/api/auth/route.ts`):

```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD belum disetel pada environment docker compose' },
      { status: 500 }
    );
  }

  if (password === configuredPassword) {
    const response = NextResponse.json({ success: true });
    // Set cookie sesi aman sederhana
    response.cookies.set('remotion_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/'
    });
    return response;
  }

  return NextResponse.json({ error: 'Kata sandi tidak valid' }, { status: 401 });
}
```

Ketika pengguna pertama kali membuka halaman web, dialog login minimalis akan muncul dan meminta kata sandi admin. Setelah validasi berhasil, status autentikasi disimpan di cookie browser.

---

## 6. Dockerfile Multi-Stage Berbasis Chromium untuk Remotion

Remotion memerlukan pustaka browser Chromium dan font sistem agar proses rendering video berjalan lancar tanpa mengalami crash font.

### Berkas `Dockerfile`:

```dockerfile
# Tahap 1: Instalasi Dependensi
FROM node:22-bookworm-slim AS base
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV DEBIAN_FRONTEND=noninteractive

# Pasang Chromium, FFmpeg, dan paket font Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ffmpeg \
    fonts-liberation \
    fonts-noto-color-emoji \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Salin manifest dependensi
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci

# Salin seluruh kode sumber
COPY . .

# Tahap 2: Build Aplikasi Web
RUN npm run build

# Beri tahu Remotion untuk menggunakan Chromium sistem yang sudah terpasang
ENV CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
```

---

## 7. Otomasi CI/CD: Publikasi Image ke GitHub Container Registry (GHCR)

Dengan GitHub Actions, setiap kali Anda melakukan update kode ke branch `main`, GitHub akan otomatis membangun image Docker dan menerbitkannya ke GHCR secara gratis.

### Berkas `.github/workflows/docker-publish.yml`:

```yaml
name: Build and Push Remotion AI Editor to GHCR

on:
  push:
    branches: [ "main" ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest
            type=sha

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

Image yang dihasilkan akan beralamat di: `ghcr.io/username/remotion-ai-editor:latest`.

---

## 8. Panduan Pengguna Awam: Menjalankan dengan Docker Compose (1 Menit Jadi)

Bagian terbaik dari arsitektur ini adalah kemudahannya bagi pengguna awam. Mereka tidak perlu menyentuh kode sedikit pun.

### Langkah 1: Buat Berkas `docker-compose.yml`
Buat folder baru di komputer atau server, lalu buat berkas bernama `docker-compose.yml` dengan isi berikut:

```yaml
version: '3.8'

services:
  remotion-editor:
    image: ghcr.io/username/remotion-ai-editor:latest
    container_name: remotion_ai_editor
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # Password login pertama yang wajib diisi oleh pengguna
      - ADMIN_PASSWORD=KatasandiRahasia123!
      - NODE_ENV=production
    volumes:
      # Tempat menyimpan video hasil render
      - ./rendered_videos:/app/out
    shm_size: '2gb' # Alokasi memori bersama penting untuk kestabilan Chromium
```

### Langkah 2: Jalankan Container
Buka terminal di folder tersebut, lalu ketik satu perintah saja:

```bash
docker compose up -d
```

Docker akan secara otomatis mengunduh image dari GHCR dan menyalakan server di latar belakang.

### Langkah 3: Gunakan Editor di Browser
1. Buka browser dan kunjungi `http://localhost:3000`.
2. Masukkan kata sandi admin yang Anda tulis pada `ADMIN_PASSWORD` (contoh: `KatasandiRahasia123!`).
3. Buka menu **Settings (Pengaturan)** di pojok kanan atas, lalu masukkan:
   * **Endpoint:** Misal `https://api.openai.com/v1` atau `https://api.deepseek.com/v1`.
   * **API Key:** Masukkan kunci API Anda (disimpan aman di LocalStorage browser Anda).
   * **Model:** Masukkan nama model (misal `gpt-4o-mini` atau `deepseek-chat`).
4. Ketik prompt video pada kotak dialog AI, contoh:
   > *"Buatkan video promosi diskon 50% produk sepatu lari lokal dengan warna latar navy gelap dan teks oranye terang."*
5. Klik **Generate Video**. Dalam hitungan 3 detik, Remotion Player akan langsung memutar video hasil rancangan AI secara interaktif.
6. Klik tombol **Export Video (MP4)** untuk mengunduh video final dengan kualitas penuh tanpa watermark.

---

## 9. Tips Kestabilan dan Skalabilitas Rendering di Lingkungan Docker

Rendering video di dalam container membutuhkan penyesuaian perangkat keras agar tidak terjadi *out-of-memory error*:

* **Parameter `shm_size: '2gb'`:** Chromium menggunakan shared memory (`/dev/shm`) untuk merender canvas grafis. Nilai bawaan Docker adalah 64MB yang terlalu kecil dan sering menyebabkan crash saat rendering. Menyetelnya minimal 2GB menjamin proses render stabil.
* **CPU Core Allocation:** Remotion mendukung rendering multi-thread secara paralel. Berikan minimal 2 hingga 4 core CPU pada VPS atau komputer server Anda agar kecepatan render video mencapai 3x hingga 5x lebih cepat dari durasi video aslinya.
* **Volume Persistent:** Mount volume `./rendered_videos:/app/out` memastikan seluruh berkas video yang telah selesai diekspor tetap aman di komputer host dan tidak hilang saat container diperbarui (*recreate*).

Arsitektur ini membuka potensi tak terbatas untuk membangun pabrik konten otomatis (*automated video engine*), studio agensi pemasaran, hingga perangkat lunak siap saji yang dapat dijalankan siapa saja hanya dengan satu baris perintah Docker.
