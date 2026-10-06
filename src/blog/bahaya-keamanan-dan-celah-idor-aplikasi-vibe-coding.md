---
title: "Bahaya Keamanan dan Celah IDOR yang Kerap Luput dari Perhatian Vibe Coder"
slug: "bahaya-keamanan-dan-celah-idor-aplikasi-vibe-coding"
date: "2026-10-06"
author: "Wahid Alimudin"
category: "Rekayasa Perangkat Lunak"
tags: ["Vibe Coding", "Keamanan Web", "IDOR", "AI Coding", "Cybersecurity", "Best Practices"]
summary: "Mengapa aplikasi hasil vibe coding rentan terhadap kebocoran data akibat celah Insecure Direct Object References (IDOR), API key terekspos, dan cara melakukan audit keamanan sebelum rilis."
readingTime: "9 menit baca"
---

Fenomena *vibe coding* yaitu cara membangun aplikasi secara cepat dengan mengandalkan instruksi bahasa alami ke model AI seperti Cursor, Claude, atau ChatGPT telah mendemokratisasi pembuatan perangkat lunak. Siapa pun kini bisa mewujudkan prototipe aplikasi SaaS yang berfungsi penuh hanya dalam hitungan jam tanpa perlu menulis sintaks baris demi baris secara manual.

Namun, di balik kemudahan visual dan kepuasan melihat fitur langsung berjalan (*it just works*), ada bahaya laten yang sangat kritis: **Aspek Keamanan Sistem**. Model kecerdasan buatan dilatih untuk memprioritaskan penyelesaian fungsional tercepat (*functional completion*), bukan perlindungan pertahanan berlapis (*defense-in-depth*).

Salah satu kerentanan paling mematikan yang hampir selalu luput dari perhatian para *vibe coder* adalah **Insecure Direct Object References (IDOR)** dan kebocoran kredensial rahasia di sisi klien (*client-side leakage*).

---

## 1. Apa Itu Celah IDOR dan Mengapa AI Sering Mengabaikannya?

Celah IDOR terjadi ketika aplikasi web menerima parameter identitas objek (seperti `id` database) langsung dari pengguna untuk mengakses atau memodifikasi data, tanpa memverifikasi apakah pengguna yang sedang login benar-benar memiliki hak atas objek tersebut.

Ketika Anda meminta AI membuatkan endpoint penghapusan faktur tagihan:
> *"Buatkan API endpoint untuk menghapus invoice berdasarkan invoiceId."*

AI sering kali menghasilkan kode yang tampak elegan seperti ini:

```typescript
// CONTOH KODE RENTAN (Dihasilkan oleh AI tanpa otorisasi)
export async function DELETE(req: Request) {
  const { invoiceId } = await req.json();

  // Bahaya: Hanya mengecek apakah invoice ada, tanpa mengecek siapa pemiliknya!
  await db.invoice.delete({
    where: { id: invoiceId }
  });

  return Response.json({ success: true });
}
```

### Skenario Eksploitasi Nyata:
Seorang penyerang yang login sebagai Pengguna A dapat membuka tab Network di browser, melihat pola permintaan API, lalu mengirimkan permintaan `DELETE` dengan mengganti `invoiceId` menjadi milik Pengguna B. Dalam sekejap, data transaksi milik kompetitor atau perusahaan lain terhapus tanpa hambatan.

---

## 2. Cara Memperbaiki Celah IDOR: Terapkan Validasi Kepemilikan Data

Setiap operasi pembacaan, pembaruan, atau penghapusan data wajib menyertakan identitas pengguna aktif (*session userId*) ke dalam klausa filter database:

```typescript
// CONTOH KODE AMAN (Verifikasi kepemilikan data berlapis)
import { getAuthenticatedUser } from '@/lib/auth';

export async function DELETE(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return Response.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  const { invoiceId } = await req.json();

  // Aman: Invoice hanya dihapus jika id invoice COCOK dan id pemilik COCOK
  const deleted = await db.invoice.deleteMany({
    where: {
      id: invoiceId,
      ownerId: user.id // Wajib mengunci ke sesi pengguna aktif
    }
  });

  if (deleted.count === 0) {
    return Response.json(
      { error: 'Faktur tidak ditemukan atau Anda tidak memiliki akses' }, 
      { status: 403 }
    );
  }

  return Response.json({ success: true });
}
```

---

## 3. Kebocoran Kunci Rahasia di Lingkungan Frontend (Client-Side Exposure)

Kesalahan fatal lain yang sering dilakukan oleh vibe coder adalah membiarkan kunci rahasia API (*secret keys*) berada di komponen React sisi klien.

Banyak pemula yang meminta AI: *"Hubungkan aplikasi ke Stripe untuk menerima pembayaran"*. AI kemudian menambahkan kunci rahasia langsung di dalam berkas komponen React atau menyetel variabel lingkungan dengan awalan publik (seperti `NEXT_PUBLIC_STRIPE_SECRET_KEY` atau `VITE_OPENAI_API_KEY`).

| Jenis Kunci | Lokasi Penyimpanan Aman | Risiko Jika Terekspos di Browser |
| :--- | :--- | :--- |
| **Public / Publishable Key** (misal: Stripe Publishable) | Aman ditaruh di Frontend | Rendah (dirancang khusus untuk inisialisasi antarmuka) |
| **Secret API Key** (misal: OpenAI, Resend, Supabase Service Role) | **Hanya di Backend / Server** | Sangat Fatal: Penyerang dapat menguras saldo kredit atau menghapus seluruh isi database |

Siapa pun dapat menekan tombol `Inspect Element`, membuka tab Sources atau Network, dan menyalin kunci rahasia Anda jika terekspos di bundle JavaScript publik.

---

## 4. Bahaya Mengabaikan Sanitasi Input & Mass Assignment

Ketika membuat formulir pembaruan profil pengguna, vibe coder sering kali membiarkan payload mentah langsung masuk ke database:

```typescript
// Bahaya Mass Assignment
const body = await req.json();
await db.user.update({
  where: { id: user.id },
  data: body // Sangat berbahaya jika penyerang menyisipkan: { "role": "admin" }
});
```

Jika penyerang menyisipkan properti `{ "role": "admin" }` atau `{ "isProSubscriber": true }` pada request JSON mereka, akun mereka akan otomatis mendapatkan hak akses admin secara cuma-cuma.

### Solusi Wajib: Gunakan Skema Validasi Ketat (Zod):
Definisikan secara eksplisit properti apa saja yang diizinkan untuk diubah oleh pengguna:

```typescript
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(50),
  bio: z.string().max(200).optional(),
});

// Hanya properti yang lolos skema yang dikirim ke database
const validatedData = UpdateProfileSchema.parse(body);
await db.user.update({
  where: { id: user.id },
  data: validatedData
});
```

---

## 5. Checklist Keamanan Wajib Sebelum Rilis Aplikasi Vibe Coding

Sebelum meluncurkan aplikasi Anda ke pengguna publik atau membagikannya di media sosial, jalankan checklist verifikasi berikut:

- [ ] Seluruh endpoint mutasi (POST, PUT, DELETE) memvalidasi kepemilikan objek berdasarkan `session.userId`.
- [ ] Tidak ada variabel lingkungan berawalan `NEXT_PUBLIC_` atau `VITE_` yang menyimpan kunci rahasia, token admin, atau password database.
- [ ] Semua input pengguna divalidasi menggunakan pustaka validasi skema seperti Zod.
- [ ] Rate limiting aktif pada rute autentikasi (login, register, reset password) untuk mencegah serangan brute force.
- [ ] Aturan CORS (*Cross-Origin Resource Sharing*) disetel spesifik hanya mengizinkan domain produksi Anda, bukan tanda bintang bebas (`*`).

Membangun aplikasi dengan AI memang terasa ajaib dan cepat. Namun, ketelitian Anda dalam mengaudit keamanan di balik layar adalah pembeda mutlak antara proyek amatir yang rentan diretas dan produk digital profesional yang layak dipercaya konsumen.
