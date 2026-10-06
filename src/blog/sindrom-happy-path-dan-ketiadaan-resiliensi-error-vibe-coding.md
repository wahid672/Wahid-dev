---
title: "Sindrom Happy Path: Mengapa Aplikasi Vibe Coding Selalu Rontok Saat Terjadi Edge Case"
slug: "sindrom-happy-path-dan-ketiadaan-resiliensi-error-vibe-coding"
date: "2026-10-06"
author: "Wahid Alimudin"
category: "Rekayasa Perangkat Lunak"
tags: ["Vibe Coding", "Happy Path", "Error Handling", "Edge Cases", "Resiliensi Sistem", "Reliability"]
summary: "Kecenderungan model AI hanya menulis kode skenario ideal tanpa penanganan kegagalan jaringan, timeout, retry berulang, serta trik merancang pertahanan tangguh terhadap edge case."
readingTime: "8 menit baca"
---

Dalam rekayasa perangkat lunak, istilah **Happy Path** merujuk pada skenario ideal di mana segala sesuatunya berjalan sempurna: pengguna memasukkan data dengan format yang benar, koneksi internet secepat kilat tanpa pernah putus, API pihak ketiga selalu merespons dalam 100 milidetik dengan kode status 200, dan disk penyimpanan server tidak pernah penuh.

Masalah terbesar dari kode yang dihasilkan oleh asisten AI dalam sesi *vibe coding* adalah: **Secara bawaan, AI hampir selalu menulis kode happy path**.

Ketika Anda meminta AI membuat fitur integrasi pembayaran: *"Hubungkan sistem checkout dengan gateway pembayaran Midtrans"*, AI akan menulis alur di mana pembayaran selalu berhasil. Jarang sekali AI secara proaktif mengantisipasi apa yang terjadi jika gateway pembayaran mengalami gangguan (*down*), webhook telat masuk 30 detik, atau pengguna menutup tab browser di tengah proses pembayaran kartu kredit.

Hasilnya adalah aplikasi yang tampak bekerja luar biasa saat presentasi demo, namun seketika memuntahkan layar putih (*White Screen of Death*) begitu menghadapi situasi dunia nyata (*edge cases*).

---

## 1. Tiga Wajah Kegagalan yang Kerap Diabaikan Vibe Coder

Perhatikan tiga skenario dunia nyata yang hampir tidak pernah diuji oleh pemula:

| Skenario Nyata | Asumsi Kode Buatan AI | Realitas di Produksi |
| :--- | :--- | :--- |
| **Koneksi Jaringan Lambat / Putus** | Permintaan `fetch()` selalu selesai dalam sekejap | Jaringan seluler pengguna turun ke sinyal 3G; tombol diklik berulang kali tanpa status loading |
| **Pihak Ketiga Hang / Timeout** | API eksternal selalu membalas cepat | Server pihak ketiga mengalami lonjakan beban dan tidak membalas sama sekali; server Anda ikut hang menunggu selamanya |
| **Data Mengandung Nilai Tak Terduga** | Properti objek selalu ada dan sesuai tipe | Server pihak ketiga mengembalikan `{ data: null }`; kode memicu error fatal `Cannot read properties of null` |

---

## 2. Bahaya `fetch()` Tanpa Batas Waktu (Timeout)

Secara bawaan, fungsi `fetch()` standar di JavaScript tidak memiliki batas waktu (*timeout*). Jika server tujuan mengalami kebuntuan, permintaan tersebut akan menggantung tanpa batas (*hang indefinitely*), menghabiskan slot worker server Anda.

```typescript
// CONTOH KODE RAPUH: Menunggu tanpa batas waktu
export async function getExchangeRate() {
  const res = await fetch('https://api.forex-provider.com/rates');
  return res.json(); // Jika server forex down, server Anda ikut beku!
}
```

### Solusi Wajib: Pasang `AbortController` untuk Timeout Otomatis:

```typescript
// KODE TANGGUH DENGAN TIMEOUT
export async function getExchangeRate(timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.forex-provider.com/rates', {
      signal: controller.signal
    });
    
    if (!res.ok) {
      throw new Error(`Server membalas dengan status: ${res.status}`);
    }
    
    return await res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Permintaan dibatalkan karena melebihi batas waktu 5 detik');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## 3. Strategi Percobaan Ulang Cerdas (Exponential Backoff Retry)

Kegagalan jaringan sering kali bersifat sementara (*transient error*), misalnya gangguan sinyal radio selama 200 milidetik saat mobil melewati terowongan.

Banyak vibe coder membiarkan aplikasi langsung menampilkan pesan error merah kepada pengguna pada kegagalan pertama. Praktik yang jauh lebih matang adalah melakukan percobaan ulang otomatis dengan jeda waktu yang meningkat secara eksponensial (*exponential backoff*):

```text
[Permintaan Gagal] -> Tunggu 500ms -> Coba Lagi (Attempt 1)
                  -> Gagal -> Tunggu 1000ms -> Coba Lagi (Attempt 2)
                  -> Gagal -> Tunggu 2000ms -> Coba Lagi (Attempt 3)
                  -> Masih Gagal -> Tampilkan Notifikasi Bersahabat ke Pengguna
```

Menggunakan pustaka seperti `tenacity` atau fitur bawaan React Query (`retry: 3`) dapat menyelamatkan lebih dari 85% transaksi yang gagal akibat fluktuasi jaringan mikro.

---

## 4. Perlindungan Antarmuka: Pasang React Error Boundary

Ketika satu komponen kecil di pojok kanan atas aplikasi mengalami error JavaScript tak tertangani (misalnya gagal membaca format tanggal), secara bawaan React akan mencopot seluruh pohon antarmuka, menyisakan layar putih kosong bagi pengguna.

Untuk mencegah bencana ini, bungkus bagian-bagian independen aplikasi Anda dengan **Error Boundary**:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallbackWidget({ error, resetErrorBoundary }: any) {
  return (
    <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-center">
      <p className="text-sm text-red-700">Widget cuaca sementara tidak dapat dimuat.</p>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded"
      >
        Coba Muat Ulang
      </button>
    </div>
  );
}

// Hanya widget ini yang menampilkan pesan fallback, sisa aplikasi tetap berjalan normal
export function DashboardLayout() {
  return (
    <main>
      <MainChart />
      <ErrorBoundary FallbackComponent={ErrorFallbackWidget}>
        <WeatherWidget />
      </ErrorBoundary>
    </main>
  );
}
```

Aplikasi kelas dunia dinilai bukan dari ketiadaan masalah, melainkan dari seberapa anggun aplikasi tersebut bertahan (*graceful degradation*) dan bangkit kembali saat menghadapi situasi terburuk di lapangan.
