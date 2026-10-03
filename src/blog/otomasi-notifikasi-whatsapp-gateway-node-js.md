---
title: "Membangun Gateway Notifikasi WhatsApp Otomatis dengan Node.js dan Antrean Pesan"
slug: "otomasi-notifikasi-whatsapp-gateway-node-js"
date: "2026-09-02"
author: "Wahid Alimudin"
category: "Automation & API"
tags: ["WhatsApp", "Node.js", "Automation", "Redis", "BullMQ", "API"]
summary: "Pelajari cara membangun backend WhatsApp Notification Gateway yang tahan banting untuk tagihan SPP, presensi santri, dan pengumuman dengan arsitektur antrean pesan Redis BullMQ."
readingTime: "5 menit baca"
---

# Membangun Gateway Notifikasi WhatsApp Otomatis dengan Node.js dan Antrean Pesan

Pengiriman notifikasi instan melalui WhatsApp memiliki rasio keterbacaan (open rate) lebih dari 90% dibandingkan email tradisional. Untuk sistem seperti [wanotif.web.id](https://wanotif.web.id), pengiriman ratusan pesan notifikasi tagihan atau presensi sekaligus memerlukan sistem antrean (*message queue*) agar tidak terjadi pemblokiran nomor akibat lonjakan trafik mendadak.

Artikel ini membahas arsitektur antrean pengiriman pesan WhatsApp menggunakan **Node.js**, **BullMQ**, dan **Redis**.

---

## 1. Mengapa Antrean Pesan (Queue) Sangat Krusial?

Ketika sistem memicu 500 pesan notifikasi secara serentak (misalnya saat pengumuman kelulusan atau tagihan bulanan), mengirimkannya secara langsung via perulangan `for` akan menyebabkan:
- Beban memori server melonjak drastis.
- Risiko nomor pengirim diblokir oleh sistem anti-spam WhatsApp karena mengirim puluhan pesan per detik tanpa interval manusiawi.
- Jika satu koneksi HTTP gagal, seluruh batch pesan berikutnya berpotensi terhenti.

Dengan antrean **BullMQ** dan **Redis**, kita dapat mengatur *rate limiter* (misalnya maksimal 1 pesan setiap 3 hingga 5 detik secara acak).

---

## 2. Implementasi Antrean Pesan dengan BullMQ

Berikut adalah kode inisialisasi antrean pesan di Node.js:

```typescript
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null
});

export interface WhatsAppNotificationPayload {
  recipientPhone: string;
  customerName: string;
  messageBody: string;
  sourceApp: string;
}

// Inisialisasi antrean notifikasi WhatsApp
export const whatsappQueue = new Queue<WhatsAppNotificationPayload>(
  'whatsapp-notifications',
  { connection: redisConnection }
);

// Worker untuk memproses pengiriman dengan jeda aman
export const whatsappWorker = new Worker<WhatsAppNotificationPayload>(
  'whatsapp-notifications',
  async (job: Job<WhatsAppNotificationPayload>) => {
    const { recipientPhone, messageBody, customerName } = job.data;
    console.log(`Memproses notifikasi untuk: ${customerName} (${recipientPhone})`);

    // Panggil gateway API WhatsApp resmi atau session Baileys
    const response = await fetch('https://api.wanotif.web.id/v1/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WANOTIF_API_KEY}`
      },
      body: JSON.stringify({
        target: recipientPhone,
        message: messageBody
      })
    });

    if (!response.ok) {
      throw new Error(`Pengiriman gagal dengan status HTTP: ${response.status}`);
    }

    // Jeda random 3-5 detik antar pesan untuk keamanan nomor
    const randomDelay = Math.floor(Math.random() * 2000) + 3000;
    await new Promise((resolve) => setTimeout(resolve, randomDelay));

    return { status: 'sent', phone: recipientPhone };
  },
  {
    connection: redisConnection,
    concurrency: 1, // Eksekusi 1 pesan per antrean untuk menjaga interval
    limiter: {
      max: 15,
      duration: 60000 // Maksimal 15 pesan per menit
    }
  }
);
```

---

## 3. Menambahkan Pekerjaan ke Antrean dari Endpoint REST API

Ketika sistem akademik atau e-commerce ingin mengirim notifikasi, cukup dorong data ke antrean secara asynchronous:

```typescript
export const kirimNotifikasiTagihan = async (
  telepon: string,
  namaWali: string,
  namaSantri: string,
  nominal: number
) => {
  const pesan = `Assalamu'alaikum Bpk/Ibu ${namaWali},\n\n` +
    `Pemberitahuan tagihan pendidikan an. *${namaSantri}* bulan ini sebesar ` +
    `*Rp ${nominal.toLocaleString('id-ID')}* telah diterbitkan.\n\n` +
    `Rincian pembayaran dapat diakses melalui portal wali santri. Terima kasih.`;

  await whatsappQueue.add(
    'tagihan-spp',
    {
      recipientPhone: telepon,
      customerName: namaWali,
      messageBody: pesan,
      sourceApp: 'SIAKAD-PONPES'
    },
    {
      attempts: 3, // Coba ulang hingga 3 kali jika terjadi kegagalan jaringan
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }
  );
};
```

---

## Kesimpulan

Menggunakan *message queue* dengan pengendalian kecepatan (rate limiting) dan mekanisme *exponential backoff retry* menjamin setiap pesan notifikasi penting sampai ke tangan pengguna secara andal dan meminimalkan resiko terblokirnya akun WhatsApp pengirim.
