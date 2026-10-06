---
title: "Jebakan N+1 Query dan Ketiadaan Indeks Database pada Aplikasi Hasil Vibe Coding"
slug: "masalah-n-plus-1-dan-ketiadaan-indeks-database-vibe-coder"
date: "2026-10-06"
author: "Wahid Alimudin"
category: "Rekayasa Perangkat Lunak"
tags: ["Vibe Coding", "Database Indexing", "N+1 Problem", "Prisma ORM", "PostgreSQL", "Performa Database"]
summary: "Mengapa aplikasi hasil vibe coding terasa sangat cepat di komputer lokal namun mendadak lambat dan down saat jumlah pengguna bertambah, akibat masalah N+1 query dan ketiadaan indeks database."
readingTime: "9 menit baca"
---

Salah satu ilusi terbesar dalam dunia *vibe coding* adalah anggapan bahwa jika aplikasi berjalan mulus di lingkungan pengembangan lokal (*localhost*), maka aplikasi tersebut otomatis siap menangani ribuan pengguna di server produksi.

Ketika menguji aplikasi di komputer sendiri, database Anda mungkin hanya berisi 5 akun pengguna uji coba dan 10 data transaksi. Pada skala data sekecil ini, kueri database yang ditulis sembarangan oleh asisten AI akan selalu selesai dalam hitungan milidetik.

Namun, begitu aplikasi diluncurkan ke publik dan tabel database terisi 50.000 data transaksi, waktu pemuatan halaman mendadak melonjak dari 150 milidetik menjadi 12 detik, penggunaan CPU server mencapai 100%, dan koneksi database mengalami kelebihan beban (*pool exhaustion*). Biang keladinya hampir selalu dua hal: **Masalah N+1 Query** dan **Ketiadaan Indeks pada Kolom Kritis**.

---

## 1. Memahami Jebakan N+1 Query pada ORM Buatan AI

Model AI sangat gemar menggunakan pemetaan relasi objek (*Object-Relational Mapping / ORM*) seperti Prisma, Drizzle, atau TypeORM karena kode yang dihasilkan tampak bersih dan mudah dibaca manusia. Sayangnya, AI sering kali menulis logika pemanggilan relasi di dalam perulangan (*loop*).

Perhatikan contoh kode yang biasa dihasilkan AI saat diminta menampilkan daftar postingan beserta nama penulisnya:

```typescript
// CONTOH KODE LAMBAT: Memicu N+1 Query Problem
const posts = await db.post.findMany(); // 1 Query untuk mengambil 100 postingan

const postsWithAuthors = await Promise.all(
  posts.map(async (post) => {
    // Bahaya: Mengirim 1 query tambahan untuk SETIAP postingan!
    const author = await db.user.findUnique({
      where: { id: post.authorId }
    });
    return { ...post, author };
  })
);
```

### Mengapa Disebut N+1?
* **1 Query Utama:** Mengambil daftar 100 postingan.
* **N Query Tambahan:** Mengirim 100 kueri terpisah ke database untuk mengambil data penulis satu per satu.
* **Total:** 101 perjalanan bolak-balik ke database (*database roundtrips*). Jika latensi jaringan antara server aplikasi dan server database adalah 15 milidetik, halaman Anda membutuhkan waktu setidaknya 1,5 detik hanya untuk menunggu kueri selesai.

### Solusi Elegan: Gunakan Eager Loading (Include / Join)
Instruksikan AI untuk mengambil data terkait dalam satu tarikan kueri SQL gabungan (*single query with JOIN*):

```typescript
// KODE CEPAT: Hanya 1 Query Tunggal
const postsWithAuthors = await db.post.findMany({
  include: {
    author: {
      select: { id: true, name: true, avatarUrl: true }
    }
  }
});
```

---

## 2. Ketiadaan Indeks Database (The Missing Index Disaster)

Secara bawaan, database relasional seperti PostgreSQL atau MySQL hanya membuat indeks pada kolom kunci utama (*Primary Key*, biasanya `id`). Kolom lain seperti `userId`, `email`, `status`, atau `created_at` **tidak memiliki indeks** kecuali didefinisikan secara eksplisit.

Ketika vibe coder meminta AI membuat skema database, AI sering kali hanya menulis skema dasar tanpa memikirkan pola pencarian di masa depan:

```prisma
// SKEMA PRISMA TANPA INDEKS (Sering dihasilkan AI)
model Transaction {
  id        String   @id @default(uuid())
  userId    String   // Tanpa indeks!
  status    String   // Tanpa indeks!
  amount    Decimal
  createdAt DateTime @default(now()) // Tanpa indeks!
}
```

### Apa yang Terjadi Saat Data Membesar?
Ketika pengguna membuka halaman riwayat transaksi mereka, aplikasi menjalankan kueri:
```sql
SELECT * FROM "Transaction" WHERE "userId" = 'user_123' ORDER BY "createdAt" DESC;
```

Tanpa indeks pada kolom `userId`, mesin database terpaksa melakukan **Full Table Scan**: membaca jutaan baris data satu demi satu dari hard disk hanya untuk mencari transaksi milik `user_123`.

### Cara Memperbaiki: Tambahkan Indeks Gabungan (Composite Index)

```prisma
// SKEMA TEROPTIMASI DENGAN INDEKS
model Transaction {
  id        String   @id @default(uuid())
  userId    String
  status    String
  amount    Decimal
  createdAt DateTime @default(now())

  // Indeks pada userId mempercepat filter kepemilikan data
  @@index([userId])
  // Indeks gabungan mempercepat filter status per user dan pengurutan tanggal
  @@index([userId, status, createdAt])
}
```

Dengan penambahan indeks ini, pencarian database berubah dari pencarian manual menyeluruh menjadi pencarian pohon biner (*B-Tree index lookup*) yang selesai dalam waktu kurang dari 2 milidetik.

---

## 3. Bahaya Kueri Tanpa Batas (Unbounded Queries)

Vibe coder sering lupa menyertakan pembatasan jumlah data (*pagination / limit*). Kode yang umum dihasilkan AI adalah:

```typescript
// Sangat Berbahaya: Mengambil seluruh baris tanpa batas
const allOrders = await db.order.findMany({
  where: { storeId }
});
```

Jika sebuah toko memiliki 40.000 pesanan, server aplikasi akan mencoba menarik seluruh 40.000 objek data tersebut ke dalam memori RAM Node.js sekaligus. Hasilnya adalah lonjakan konsumsi memori (*Memory Out of Bounds*) dan server seketika mengalami crash.

### Wajib Gunakan Paginasi Berbasis Kursor (Cursor-Based Pagination):

```typescript
const pageSize = 20;
const orders = await db.order.findMany({
  where: { storeId },
  take: pageSize,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' }
});
```

---

## 4. Cara Mendeteksi Kueri Lambat dengan EXPLAIN ANALYZE

Jangan menebak-nebak performa database Anda. Anda dapat memeriksa rencana eksekusi kueri langsung di antarmuka database (seperti DBeaver, TablePlus, atau terminal psql):

```sql
EXPLAIN ANALYZE 
SELECT * FROM "Transaction" 
WHERE "userId" = 'user_999' 
ORDER BY "createdAt" DESC;
```

* **Jika Hasilnya Menampilkan `Seq Scan` (Sequential Scan):** Tanda bahaya. Database Anda membaca seluruh baris tabel secara lambat karena kolom tersebut tidak memiliki indeks.
* **Jika Hasilnya Menampilkan `Index Scan` atau `Bitmap Index Scan`:** Selamat, kueri Anda sudah teroptimasi dengan indeks berkecepatan tinggi.

Memahami pola kueri dan struktur indeks database memastikan aplikasi hasil vibe coding Anda tidak hanya terlihat memukau saat demo, tetapi juga kokoh melayani lonjakan puluhan ribu pengguna tanpa pernah tumbang.
