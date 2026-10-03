---
title: "Implementasi Event-Driven Microservices Menggunakan Redis Streams dan Consumer Groups"
slug: "tutorial-redis-streams-event-driven-architecture"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["Redis", "Microservices", "Backend", "Event-Driven", "Architecture"]
summary: "Tutorial membuat pesan terdistribusi yang andal dengan Redis Streams, fitur consumer groups, acknowledgment pesan, dan penanganan pending task."
readingTime: "7 menit baca"
---

Dalam arsitektur microservices, komunikasi asynchronous berbasis event sangat krusial untuk mencegah kegagalan berantai (*cascading failure*). Banyak tim teknik tergoda langsung memasang Apache Kafka atau RabbitMQ. Meskipun handal, kedua teknologi tersebut memerlukan alokasi cluster mandiri, konfigurasi ZooKeeper/KRaft yang rumit, serta konsumsi memori minimum yang cukup besar.

Jika infrastruktur Anda telah menjalankan **Redis**, Anda sebenarnya telah memiliki mesin event log terdistribusi kelas enterprise bernama **Redis Streams** (diperkenalkan sejak Redis 5.0). 

Berbeda dengan Redis Pub/Sub biasa yang tidak memiliki persistensi data (*fire-and-forget*), Redis Streams mencatat setiap pesan ke dalam append-only log di disk, mendukung penyeimbangan beban (*Consumer Groups*), dan menyediakan mekanisme konfirmasi penerimaan pesan (*Message Acknowledgment*).

---

## 1. Anatomi Alur Kerja Redis Streams

Pola kerja Redis Streams menyerupai log transaksi:
- **Stream Key:** Aliran log tempat pesan ditambahkan secara sekuensial (contoh: `orders:events`).
- **Entry ID:** Identifikasi unik berbasis milidetik waktu (`<timestamp>-<urutan>`).
- **Consumer Group:** Sekelompok layanan pekerja yang membagi tugas konsumsi pesan agar satu pesan hanya dieksekusi satu kali oleh salah satu worker.
- **PEL (Pending Entries List):** Daftar pesan yang sudah diambil worker namun belum dikonfirmasi selesai melalui perintah `XACK`.

---

## 2. Membangun Produsen Event (Producer Service)

Mari kita simulasikan layanan checkout e-commerce yang mempublikasikan event pembayaran berhasil menggunakan Node.js dan pustaka `ioredis`:

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

interface OrderPayload {
  orderId: string;
  userId: string;
  totalAmount: number;
  paymentMethod: string;
}

async function publishOrderCreatedEvent(order: OrderPayload) {
  try {
    // XADD stream_key * field1 value1 field2 value2 ...
    // Karakter '*' meminta Redis menghasilkan Entry ID otomatis berbasis waktu
    const messageId = await redis.xadd(
      'orders:events',
      '*',
      'event_type', 'ORDER_CREATED',
      'order_id', order.orderId,
      'user_id', order.userId,
      'amount', order.totalAmount.toString(),
      'payment_method', order.paymentMethod,
      'created_at', new Date().toISOString()
    );

    console.log(`[PRODUCER] Event berhasil dipublikasikan. ID Pesan: ${messageId}`);
  } catch (error) {
    console.error('Gagal mengirim event ke Redis Streams:', error);
  }
}

// Simulasi pengiriman event
publishOrderCreatedEvent({
  orderId: 'ORD-98213',
  userId: 'USR-5501',
  totalAmount: 450000,
  paymentMethod: 'VIRTUAL_ACCOUNT',
});
```

---

## 3. Menyiapkan Consumer Group di Redis

Sebelum menjalankan worker, inisialisasi Consumer Group melalui Redis CLI:

```bash
# XGROUP CREATE stream_key group_name ID_MULAI [MKSTREAM]
# ID '$' menandakan grup hanya akan membaca pesan baru yang masuk setelah grup dibuat
redis-cli XGROUP CREATE orders:events billing-service-group $ MKSTREAM
```

Opsi `MKSTREAM` otomatis membuat stream jika aliran log tersebut belum ada di database.

---

## 4. Membangun Konsumen Andal dengan Acknowledgment

Sekarang, kita buat worker pada layanan *Billing Service*. Worker akan mendengarkan pesan baru secara kontinu, memproses invoice, dan mengirimkan sinyal `XACK`:

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

const STREAM_NAME = 'orders:events';
const GROUP_NAME = 'billing-service-group';
const CONSUMER_NAME = `worker-${process.pid}`;

async function startConsumer() {
  console.log(`[CONSUMER] Worker aktif dengan nama: ${CONSUMER_NAME}`);

  while (true) {
    try {
      // XREADGROUP GROUP group_name consumer_name BLOCK timeout_ms STREAMS stream_key id
      // ID '>' meminta pesan baru yang belum pernah dikirimkan ke worker mana pun dalam grup ini
      const response = await redis.xreadgroup(
        'GROUP', GROUP_NAME, CONSUMER_NAME,
        'BLOCK', 5000,
        'COUNT', 10,
        'STREAMS', STREAM_NAME, '>'
      );

      if (!response) {
        // Timeout 5 detik berakhir tanpa pesan baru, ulangi loop
        continue;
      }

      const [streamKey, messages] = response[0];

      for (const [messageId, fields] of messages) {
        // Konversi array flat [key, val, key, val] menjadi objek JavaScript
        const payload: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          payload[fields[i]] = fields[i + 1];
        }

        console.log(`\n[PROSES] Menangani pesanan: ${payload.order_id} (Pesan ID: ${messageId})`);

        // Simulasi logika bisnis: generate PDF invoice & potong stok gudang
        await processInvoice(payload);

        // Kirim konfirmasi (XACK) bahwa pesan telah tuntas diproses
        await redis.xack(STREAM_NAME, GROUP_NAME, messageId);
        console.log(`[SUKSES] Pesan ${messageId} berhasil di-ACK.`);
      }
    } catch (err) {
      console.error('[ERROR] Terjadi kegagalan di worker loop:', err);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

async function processInvoice(data: Record<string, string>) {
  // Simulasi I/O
  await new Promise((resolve) => setTimeout(resolve, 800));
}

startConsumer();
```

---

## 5. Menangani Kegagalan Worker (Dead Worker Recovery)

Jika salah satu worker tiba-tiba mengalami crash atau kehabisan memori di tengah proses, pesan yang sedang dikerjakannya akan tertahan di status **PEL (Pending Entries List)**.

Untuk mengambil alih tugas yang menggantung tersebut, jalankan scheduler terpisah menggunakan perintah `XAUTOCLAIM`:

```typescript
// Ambil alih pesan pending yang telah menggantung lebih dari 60 detik (60000 ms)
const pending = await redis.xautoclaim(
  STREAM_NAME,
  GROUP_NAME,
  CONSUMER_NAME,
  60000,
  '0-0',
  'COUNT', 5
);

const [nextStartId, recoveredMessages] = pending;
for (const [msgId, fields] of recoveredMessages) {
  console.log(`[RECOVERY] Mengambil alih tugas pending ID: ${msgId}`);
  // Proses ulang dan beri XACK...
}
```

Fitur auto-claim ini menjamin jaminan pengiriman **at-least-once delivery**, memastikan tidak ada data transaksi pelanggan yang hilang di tengah jalan.

---

## Kesimpulan

Redis Streams adalah alternatif ringan, cepat, dan tangguh dibandingkan sistem antrean pesan berskala berat. Bagi mayoritas arsitektur microservices modern, Redis Streams mampu menangani jutaan event harian dengan latensi sub-milidetik tanpa perlu menambah biaya operasional server terpisah.
