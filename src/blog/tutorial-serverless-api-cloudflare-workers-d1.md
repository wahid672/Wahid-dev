---
title: "Membangun Serverless REST API di Edge Menggunakan Cloudflare Workers dan Database D1"
slug: "tutorial-serverless-api-cloudflare-workers-d1"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["Cloudflare", "Serverless", "Edge Computing", "TypeScript", "SQL"]
summary: "Panduan merancang API latensi ultra-rendah dengan Cloudflare Workers, SQLite terdistribusi D1, dan deployment global instan tanpa manajemen VPS."
readingTime: "7 menit baca"
---

Arsitektur backend serverless konvensional seperti AWS Lambda atau Google Cloud Run kerap menghadapi satu tantangan klasik: **Cold Start Latency**. Ketika container harus diinisialisasi dari kondisi mati, pengguna pertama harus menanggung jeda tunggu 500 milidetik hingga beberapa detik.

Cloudflare Workers merevolusi komputasi awan melalui arsitektur **V8 Isolates**. Tanpa overhead virtual machine atau container Linux, script TypeScript Anda dieksekusi di lebih dari 300 data center edge di seluruh dunia dalam waktu kurang dari 5 milidetik.

Dipadukan dengan **Cloudflare D1**, database SQL terdistribusi berbasis SQLite murni, Anda dapat membangun API CRUD berkecepatan tinggi tanpa perlu memusingkan sewa VPS, patch kernel Linux, ataupun konfigurasi load balancer.

---

## 1. Menyiapkan Proyek Wrangler & TypeScript

Pastikan Node.js telah terpasang, lalu buat proyek Workers baru menggunakan CLI resmi Wrangler:

```bash
npm create cloudflare@latest edge-api-service -- --type hello-world-ts
cd edge-api-service
npm install itty-router
```

Pustaka `itty-router` sengaja kita gunakan karena ukurannya yang mikro (hanya sekitar 450 bytes), menjadikannya router HTTP paling ideal untuk lingkungan edge.

---

## 2. Membuat dan Mengikat Database Cloudflare D1

Jalankan perintah berikut untuk membuat database D1 baru di akun Cloudflare Anda:

```bash
npx wrangler d1 create production-db
```

Output terminal akan menampilkan konfigurasi binding database. Buka berkas `wrangler.jsonc` (atau `wrangler.toml`) dan tambahkan blok konfigurasi tersebut:

```json
{
  "name": "edge-api-service",
  "main": "src/index.ts",
  "compatibility_date": "2024-09-23",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "production-db",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

Binding `DB` memungkinkan kita mengeksekusi query SQL langsung dari kode TypeScript melalui objek lingkungan runtime (`env.DB`).

---

## 3. Merancang Skema Database dan Migrasi

Buat berkas skema SQL lokal di `schemas/init.sql`:

```sql
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
```

Terapkan skema tersebut ke database lokal untuk proses development:

```bash
npx wrangler d1 execute production-db --local --file=./schemas/init.sql
```

Dan terapkan ke database cloud produksi saat Anda siap rilis:

```bash
npx wrangler d1 execute production-db --remote --file=./schemas/init.sql
```

---

## 4. Mengembangkan Endpoint REST API

Buka berkas `src/index.ts` dan bangun controller RESTful lengkap dengan penanganan JSON, validasi parameter, dan eksekusi query D1 berparameter (*prepared statements*):

```typescript
import { AutoRouter } from 'itty-router';

export interface Env {
  DB: D1Database;
}

const router = AutoRouter();

// Helper untuk header response JSON standar CORS
const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

// 1. GET /api/products: Mengambil seluruh daftar produk
router.get('/api/products', async (request, env: Env) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM products ORDER BY created_at DESC LIMIT 50'
  ).all();

  return new Response(JSON.stringify({ success: true, data: results }), {
    headers: jsonHeaders,
  });
});

// 2. GET /api/products/:id: Mengambil satu detail produk
router.get('/api/products/:id', async (request, env: Env) => {
  const { id } = request.params;
  const product = await env.DB.prepare(
    'SELECT * FROM products WHERE id = ?'
  ).bind(id).first();

  if (!product) {
    return new Response(JSON.stringify({ success: false, message: 'Produk tidak ditemukan' }), {
      status: 404,
      headers: jsonHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true, data: product }), {
    headers: jsonHeaders,
  });
});

// 3. POST /api/products: Menambahkan produk baru
router.post('/api/products', async (request, env: Env) => {
  try {
    const body = await request.json() as { name: string; price: number; stock: number };
    
    if (!body.name || typeof body.price !== 'number') {
      return new Response(JSON.stringify({ success: false, message: 'Nama dan harga wajib diisi' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const id = crypto.randomUUID();
    const stock = body.stock ?? 0;

    await env.DB.prepare(
      'INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)'
    ).bind(id, body.name, body.price, stock).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Produk berhasil disimpan',
      productId: id,
    }), {
      status: 201,
      headers: jsonHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Format JSON tidak valid' }), {
      status: 400,
      headers: jsonHeaders,
    });
  }
});

// 4. Default 404 Handler
router.all('*', () => new Response(JSON.stringify({ message: 'Rute tidak ditemukan' }), {
  status: 404,
  headers: jsonHeaders,
}));

export default {
  fetch: router.fetch,
};
```

---

## 5. Pengujian Lokal dan Deployment Global

Uji coba endpoint di komputer lokal menggunakan runtime Miniflare bawaan Wrangler:

```bash
npx wrangler dev
```

Coba kirim permintaan POST menggunakan `curl`:

```bash
curl -X POST http://localhost:8787/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Mikrokontroler ESP32 NodeMCU", "price": 65000, "stock": 40}'
```

Jika data berhasil kembali dengan status 201, deploy API Anda ke edge global Cloudflare:

```bash
npx wrangler deploy
```

Dalam waktu kurang dari 10 detik, API Anda telah tersebar di ratusan titik server di seluruh belahan dunia, melayani permintaan pengguna dari Jakarta, Singapura, hingga Frankfurt dengan latensi round-trip seminimal mungkin.

---

## Kesimpulan

Kombinasi Cloudflare Workers dan D1 menghapus friksi DevOps yang melelahkan. Anda tidak lagi memerlukan pemeliharaan server database terpisah untuk API berskala menengah; infrastruktur edge siap melayani lonjakan jutaan trafik secara otomatis dengan efisiensi biaya tertinggi.
