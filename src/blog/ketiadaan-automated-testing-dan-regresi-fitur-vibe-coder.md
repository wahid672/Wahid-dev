---
title: "Ketiadaan Automated Testing: Mengapa Prompt Baru Vibe Coder Selalu Merusak Fitur Lama"
slug: "ketiadaan-automated-testing-dan-regresi-fitur-vibe-coder"
date: "2026-10-06"
author: "Wahid Alimudin"
category: "Rekayasa Perangkat Lunak"
tags: ["Vibe Coding", "Automated Testing", "Vitest", "Playwright", "Regresi Fitur", "Software Quality"]
summary: "Mengapa setiap kali Anda meminta AI menambahkan fitur baru, fitur lama yang sebelumnya berjalan mendadak rusak (regresi), dan cara membangun pagar pengaman uji otomatis."
readingTime: "9 menit baca"
---

Pernahkah Anda mengalami siklus frustrasi yang berulang dalam proses *vibe coding*:
1. Fitur sistem keranjang belanja Anda sudah berjalan sempurna.
2. Anda memberikan prompt baru ke asisten AI: *"Tolong tambahkan fitur kupon diskon dan pilihan mata uang asing"*.
3. Fitur kupon diskon baru memang berhasil berjalan dengan baik.
4. Namun, ketika Anda mencoba melakukan checkout ulang, tombol pembayaran utama mendadak tidak merespons sama sekali, formulir alamat hilang, dan perhitungan ongkos kirim menjadi kacau.

Masalah ini dalam rekayasa perangkat lunak disebut sebagai **Regresi Fitur (Feature Regression)**: situasi di mana modifikasi kode baru secara tidak sengaja merusak fungsionalitas lama yang sebelumnya sudah berjalan stabil.

Di lingkungan vibe coding di mana Anda tidak membaca setiap baris perubahan kode yang dibuat oleh AI, ketiadaan **Automated Testing (Pengujian Otomatis)** adalah akar utama mengapa proyek Anda terasa seperti rumah kartu: menambah satu kartu baru membuat seluruh bangunan runtuh.

---

## 1. Mengapa Model AI Sangat Rentan Menimbulkan Masalah Regresi?

Model AI (seperti Claude, GPT-4o, atau Cursor Composer) bekerja dengan memproses jendela konteks (*context window*). Ketika ukuran proyek Anda membesar melebihi puluhan file:
* AI sering kali hanya berfokus pada file yang sedang dibuka atau potongan kode yang disebutkan dalam prompt terakhir.
* AI tidak menyadari bahwa mengubah tipe data suatu fungsi bantuan (*helper function*) di file A akan merusak 8 komponen lain di file B, C, dan D yang bergantung pada format lama.
* Jika tidak ada sistem pengujian otomatis, Anda baru menyadari kerusakan tersebut berhari-hari kemudian setelah menerima komplain dari pengguna Anda di server produksi.

---

## 2. Pagar Pengaman Minimalis: Konsep "Minimum Viable Testing"

Banyak vibe coder enggan menulis tes karena membayangkan harus menulis ribuan baris kode pengujian yang membosankan. Anda tidak perlu menguji 100% basis kode Anda. Terapkan strategi **Minimum Viable Testing**: cukup lindungi 20% alur kerja paling kritis yang menghasilkan 80% nilai bisnis aplikasi Anda.

```text
       [Pengujian End-to-End (E2E) dengan Playwright]
       -> 2-3 Skenario Kritis: Alur Login & Alur Checkout Pembayaran
                             |
       [Pengujian Unit & Integrasi dengan Vitest]
       -> Fungsi Kalkulasi Diskon, Perhitungan Pajak, Skema Validasi
```

---

## 3. Langkah 1: Pengujian Unit Fungsi Kritis dengan Vitest

Pustaka uji unit tercepat dan paling modern di ekosistem JavaScript saat ini adalah **Vitest**.

Pasang dependensi:
```bash
npm install -D vitest
```

Tambahkan naskah uji coba untuk fungsi penting, misalnya kalkulasi diskon (`src/lib/discount.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { calculateFinalPrice } from './discount';

describe('Kalkulasi Diskon Pesanan', () => {
  it('harus memotong harga dengan persentase yang benar', () => {
    const result = calculateFinalPrice(100000, 'DISKON20');
    expect(result).toBe(80000);
  });

  it('tidak boleh memberikan potongan harga negatif jika kupon tidak valid', () => {
    const result = calculateFinalPrice(100000, 'KODE_PALSU');
    expect(result).toBe(100000);
  });

  it('tidak boleh menghasilkan harga di bawah nol jika diskon melebihi nilai barang', () => {
    const result = calculateFinalPrice(50000, 'DISKON100RB');
    expect(result).toBe(0);
  });
});
```

Jalankan perintah pengujian:
```bash
npx vitest run
```

Kini, setiap kali AI mengubah kode fungsi diskon, Anda cukup menjalankan perintah di atas dalam waktu 1 detik. Jika ada kesalahan logika yang merusak alur lama, Vitest akan langsung berteriak dengan tanda silang merah di terminal Anda sebelum kode tersebut diunggah ke server produksi.

---

## 4. Langkah 2: Pengujian Alur Nyata Pengguna dengan Playwright

Untuk memastikan seluruh alur kerja antarmuka berjalan sempurna dari sudut pandang pengguna manusia (misal: membuka browser, mengisi form login, dan menekan tombol checkout), gunakan **Playwright**:

```bash
npm install -D @playwright/test
```

Contoh berkas uji alur login (`tests/auth.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test('Pengguna dapat login dan diarahkan ke dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  // Isi form login
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'PasswordAman123!');
  await page.click('button[type="submit"]');

  // Pastikan URL berubah ke dashboard dan nama pengguna muncul di layar
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('h1')).toContainText('Selamat Datang');
});
```

Playwright akan secara otomatis membuka browser Chrome virtual di latar belakang, menjalankan skenario di atas dalam hitungan detik, dan mengambil tangkapan layar jika terjadi kegagalan.

---

## 5. Menjadikan Pengujian Sebagai Penjaga Gerbang Otomatis (CI Guardrail)

Pasang pengujian otomatis ini ke dalam GitHub Actions Anda (`.github/workflows/test.yml`).

Setiap kali Anda melakukan perintah `git push` atau meminta AI membuat *Pull Request* baru:
1. GitHub secara otomatis menjalankan `npm run type-check` dan `npx vitest run`.
2. Jika ada fitur lama yang rusak akibat prompt AI terbaru, proses penggabungan kode (*merge*) akan ditolak secara otomatis.

Dengan memasang pagar pengaman uji otomatis ini, Anda dapat terus melakukan *vibe coding* dengan kecepatan maksimal dan rasa percaya diri penuh tanpa pernah khawatir merusak fitur yang sudah berjalan sebelumnya.
