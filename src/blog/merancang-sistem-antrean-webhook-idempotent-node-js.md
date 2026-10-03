---
title: "Membangun Webhook Receiver yang Idempotent untuk Payment Gateway"
slug: "merancang-sistem-antrean-webhook-idempotent-node-js"
date: "2026-08-15"
author: "Wahid Alimudin"
category: "Automation & API"
tags: ["Webhook", "Idempotency", "Payment Gateway", "Node.js", "Redis", "Security"]
summary: "Teknik merancang endpoint webhook pembayaran yang kebal transaksi ganda (idempotent) menggunakan verifikasi signature SHA256 dan kunci atomik Redis."
readingTime: "5 menit baca"
---

# Membangun Webhook Receiver yang Idempotent untuk Payment Gateway

Ketika mengintegrasikan gateway pembayaran (seperti Midtrans, Xendit, atau Stripe) pada sistem pendaftaran sekolah [psbonline.id](https://psbonline.id), penyedia gateway secara berkala mengirimkan notifikasi HTTP POST (webhook) untuk mengabarkan bahwa calon santri telah berhasil membayar biaya formulir.

Namun, jaringan internet tidak selalu stabil. Gateway sering mengirimkan ulang webhook berkali-kali (*retry mechanism*) jika server Anda terlambat merespons. Jika endpoint Anda tidak memiliki sifat **idempotent**, saldo atau status pembayaran dapat tercatat dua kali.

Artikel ini membahas cara membangun receiver webhook yang aman dan anti-duplikasi.

---

## 1. Verifikasi Signature Kriptografi HMAC-SHA256

Sebelum memproses payload, pastikan request benar-benar berasal dari gateway resmi, bukan dari penyerang:

```typescript
import crypto from 'crypto';
import { Request, Response } from 'express';

export const verifyGatewaySignature = (
  rawBody: string,
  incomingSignature: string,
  serverSecretKey: string
): boolean => {
  const computedSignature = crypto
    .createHmac('sha256', serverSecretKey)
    .update(rawBody)
    .digest('hex');

  // Gunakan timingSafeEqual untuk mencegah serangan timing attack
  return crypto.timingSafeEqual(
    Buffer.from(incomingSignature, 'utf8'),
    Buffer.from(computedSignature, 'utf8')
  );
};
```

---

## 2. Kunci Idempotensi Atomik Menggunakan Redis SETNX

Idempotensi berarti operasi yang dijalankan berkali-kali dengan parameter yang sama akan menghasilkan hasil akhir yang identik tanpa efek samping tambahan.

Kita dapat memanfaatkan perintah `SET key value NX EX` di Redis:

```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

export const processPaymentWebhook = async (req: Request, res: Response) => {
  const { order_id, transaction_status, gross_amount } = req.body;

  // Kunci unik idempotensi berdasarkan ID transaksi gateway
  const idempotencyKey = `webhook:payment:${order_id}:${transaction_status}`;

  // Kunci atomik selama 24 jam (86400 detik)
  // Perintah 'NX' hanya akan berhasil jika kunci belum pernah ada
  const acquiredLock = await redis.set(idempotencyKey, 'PROCESSED', 'EX', 86400, 'NX');

  if (!acquiredLock) {
    // Webhook ini sudah pernah diproses sebelumnya
    console.log(`Webhook duplikat terdeteksi untuk order: ${order_id}. Abaikan proses ulang.`);
    // Selalu balas HTTP 200 OK agar gateway menghentikan pengiriman retry
    return res.status(200).json({ status: 'duplicate_ignored' });
  }

  try {
    // Jalankan transaksi database (misal update status tagihan menjadi LUNAS)
    await markOrderAsPaid(order_id, gross_amount);

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    // Jika proses database gagal, hapus kunci agar retry berikutnya dapat dicoba
    await redis.del(idempotencyKey);
    return res.status(500).json({ error: 'Internal database error' });
  }
};
```

---

## 3. Selalu Berikan Respons HTTP 200 dengan Cepat

Jangan jalankan tugas berat (seperti pembuatan file PDF kwitansi atau pengiriman pesan WhatsApp) secara synchronous di dalam handler webhook. Masukkan tugas tersebut ke antrean background (seperti BullMQ) dan segera kirim balasan status HTTP 200 ke gateway dalam waktu kurang dari 500 ms.

---

## Kesimpulan

Dengan memverifikasi *cryptographic signature* dan menerapkan kunci idempotensi Redis, sistem pembayaran otomatis Anda terlindungi dari kegagalan sinkronisasi dan pencatatan transaksi ganda.
