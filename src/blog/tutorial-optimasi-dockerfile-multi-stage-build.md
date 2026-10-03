---
title: "Optimasi Dockerfile Multi-Stage Build: Pangkas Ukuran Image dari 1 GB ke 30 MB"
slug: "tutorial-optimasi-dockerfile-multi-stage-build"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["Docker", "DevOps", "Container", "CI/CD", "Linux"]
summary: "Cara merampingkan image container Docker aplikasi Node.js dan Go menggunakan multi-stage build, Alpine Linux, dan non-root security context."
readingTime: "6 menit baca"
---

Membangun image Docker untuk aplikasi modern sering kali menghasilkan ukuran file yang membengkak luar biasa. Praktik pembuatan image standar tanpa optimasi sering menyertakan compiler, paket pengembangan C/C++, manajer paket, dependensi pengujian, hingga berkas cache npm yang sama sekali tidak dibutuhkan pada saat runtime produksi.

Image container berukuran 1.2 GB memperlambat proses deployment pipeline CI/CD, memakan kuota bandwidth server registry, dan memperluas celah kerentanan keamanan siber (*Common Vulnerabilities and Exposures / CVE*).

Dalam tutorial teknis ini, kita akan membongkar strategi **Multi-Stage Build** untuk memangkas ukuran image Docker aplikasi Node.js dan Go hingga di bawah 30 MB dengan postur keamanan tingkat tinggi.

---

## 1. Anatomi Masalah: Mengapa Image Docker Membengkak?

Perhatikan contoh Dockerfile Node.js yang umum dibuat oleh pemula:

```dockerfile
# CONTOH BURUK (Ukuran akhir: ~1.1 GB)
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Kelemahan Fatal:**
1. Base image `node:20` berbasis Debian lengkap dengan utilitas compiler, manajer paket `apt`, dan pustaka grafis yang tidak diperlukan oleh runtime Node.js.
2. Seluruh folder `node_modules` yang berisi devDependencies (TypeScript compiler, linter, test runner) ikut terbungkus ke image akhir.
3. Kontainer berjalan sebagai pengguna root (`UID 0`), membuka risiko eskalasi hak akses sistem operasi host jika aplikasi mengalami kerentanan injeksi.

---

## 2. Implementasi Multi-Stage Build untuk Node.js

Dengan Multi-Stage Build, kita memisahkan tahap kompilasi (*builder stage*) dari tahap runtime akhir (*runner stage*). Seluruh alat kompilasi berat akan dibuang dari image final:

```dockerfile
# -------------------------------------------------------------
# TAHAP 1: Dependensi Inti (Dependencies Layer)
# -------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Menginstal dependensi hanya jika package.json berubah (Docker Cache)
COPY package.json package-lock.json ./
RUN npm ci

# -------------------------------------------------------------
# TAHAP 2: Kompilasi Kode (Builder Layer)
# -------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Kompilasi TypeScript ke JavaScript murni
RUN npm run build

# Bersihkan devDependencies untuk menyisakan pustaka runtime produksi saja
RUN npm prune --production

# -------------------------------------------------------------
# TAHAP 3: Image Runtime Produksi (Final Runner Layer)
# -------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Konfigurasi mode produksi untuk optimasi performa Node.js
ENV NODE_ENV=production

# Praktik Keamanan: Buat grup dan pengguna non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp

# Salin HANYA aset yang diperlukan dari tahap builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Alihkan kepemilikan berkas ke pengguna non-root
USER nodeapp

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Hasil Pengujian Kompresi:
- Ukuran image awal tanpa multi-stage: **1.18 GB**
- Ukuran image setelah multi-stage berbasis Alpine: **128 MB** (turun 89%)

---

## 3. Tingkat Lanjut: Multi-Stage pada Aplikasi Golang (Dari 850 MB ke 15 MB)

Pada bahasa yang menghasilkan binary mandiri seperti Go atau Rust, efisiensi multi-stage build bahkan jauh lebih radikal:

```dockerfile
# -------------------------------------------------------------
# TAHAP BUILDER: Kompilasi Binary Statis
# -------------------------------------------------------------
FROM golang:1.23-alpine AS builder
WORKDIR /src

# Pasang sertifikat SSL CA untuk koneksi HTTPS
RUN apk add --no-cache ca-certificates git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Kompilasi binary dengan CGO dimatikan untuk portabilitas Linux murni
# Opsi -ldflags="-w -s" memotong metadata simbol debugging untuk merampingkan ukuran
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o /bin/api-server ./cmd/server

# -------------------------------------------------------------
# TAHAP RUNNER: Base Image Kosong (Scratch / Distroless)
# -------------------------------------------------------------
FROM scratch
WORKDIR /app

# Salin sertifikat root agar kontainer dapat memanggil endpoint HTTPS eksternal
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /bin/api-server /app/api-server

# Port layanan
EXPOSE 8080

# Jalankan langsung binary tanpa shell
ENTRYPOINT ["/app/api-server"]
```

### Hasil Pengujian:
Image berbasis `scratch` hanya memuat binary aplikasi murni dan sertifikat SSL tanpa utilitas shell bash maupun package manager apa pun.
- Ukuran image awal: **870 MB**
- Ukuran image akhir scratch: **14.8 MB** (turun 98.3%)

---

## 4. Keuntungan Nyata di Pipeline CI/CD Produksi

1. **Waktu Tarik Cepat (*Fast Pull Time*):**
   Saat node Kubernetes melakukan autoscaling otomatis saat lonjakan trafik, waktu mengunduh image 15 MB hanya memakan waktu 1 detik dibandingkan mengunduh image 1 GB yang memakan waktu hampir 1 menit.
2. **Celah Serangan Nol (*Attack Surface Reduction*):**
   Karena image akhir tidak memiliki `bash`, `curl`, atau `apt`, peretas tidak dapat mengeksekusi shell injection jika menemukan celah di level aplikasi.

---

## Kesimpulan

Multi-Stage Build bukan sekadar teknik menghemat ruang hard disk server, melainkan standar baku profesionalitas deployment perangkat lunak modern. Terapkan pola ini pada setiap pipeline Docker Anda untuk efisiensi biaya infrastruktur cloud yang terukur.
