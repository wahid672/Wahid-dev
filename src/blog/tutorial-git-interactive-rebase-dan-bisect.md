---
title: "Menguasai Git Tingkat Lanjut: Panduan Interactive Rebase dan Debugging dengan Git Bisect"
slug: "tutorial-git-interactive-rebase-dan-bisect"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["Git", "DevOps", "Version Control", "Debugging", "Workflow"]
summary: "Teknik merapikan riwayat commit dengan git rebase interactive (squash, reword, fixup) serta melacak sumber bug tersembunyi dengan git bisect otomatis."
readingTime: "6 menit baca"
---

Hampir semua pengembang perangkat lunak mengetahui perintah dasar `git add`, `git commit`, dan `git push`. Namun, ketika bekerja dalam tim skala besar atau proyek open-source bereputasi tinggi, riwayat commit yang berantakan (*"wip"*, *"fix typo"*, *"coba lagi"*) mencerminkan ketidakrapihan rekayasa kode dan menyulitkan proses peninjauan (*code review*).

Selain itu, ketika bug regresi tiba-tiba muncul di sistem produksi setelah puluhan commit digabungkan, mencari commit mana yang memicu kerusakan secara manual adalah mimpi buruk yang membuang waktu.

Artikel ini membahas dua perkakas Git paling ampuh untuk developer senior: **Interactive Rebase** untuk menjaga riwayat kode tetap bersih, serta **Git Bisect** untuk melacak bug dengan algoritma pencarian biner (*binary search*).

---

## 1. Merapikan Riwayat Commit dengan Interactive Rebase

Bayangkan Anda sedang mengerjakan fitur baru di branch lokal dan telah membuat 5 commit kecil yang berantakan:

```text
a1b2c3d feat: buat form login
e4f5g6h fix typo tombol
i7j8k9l coba perbaiki padding
m1n2o3p tambahkan validasi email
q4r5s6t fix console log
```

Sebelum mengajukan Pull Request (PR) ke branch `main`, satukan commit-commit tersebut menggunakan perintah:

```bash
git rebase -i HEAD~5
```

Git akan membuka editor teks terminal dengan daftar commit beserta aksi perintah di baris paling depan:

```text
pick a1b2c3d feat: buat form login
pick e4f5g6h fix typo tombol
pick i7j8k9l coba perbaiki padding
pick m1n2o3p tambahkan validasi email
pick q4r5s6t fix console log

# Commands:
# p, pick = gunakan commit
# r, reword = gunakan commit, tetapi edit pesan commit
# e, edit = gunakan commit, tetapi berhenti untuk amend
# s, squash = gabungkan ke commit sebelumnya dan kombinasikan pesan
# f, fixup = gabungkan ke commit sebelumnya dan buang pesannya
# d, drop = buang commit ini
```

Ubah perintah pada baris commit menjadi:

```text
pick a1b2c3d feat: buat form login
f e4f5g6h fix typo tombol
f i7j8k9l coba perbaiki padding
s m1n2o3p tambahkan validasi email
f q4r5s6t fix console log
```

**Penjelasan Tindakan:**
- `fixup (f)`: Menggabungkan perubahan kode ke commit di atasnya tanpa mengotori riwayat dengan pesan log "typo".
- `squash (s)`: Menggabungkan commit validasi dan memberi Anda kesempatan mengedit pesan akhir menjadi lebih deskriptif.

Simpan dan tutup editor. Riwayat git branch Anda kini hanya memiliki 1 atau 2 commit yang sangat rapi, bermakna, dan mudah diaudit oleh tim.

> **Peringatan Penting:** Jangan pernah melakukan rebase pada commit yang sudah di-push ke branch bersama publik yang sedang digunakan oleh rekan tim lain. Lakukan rebase hanya pada branch kerja lokal Anda.

---

## 2. Melacak Sumber Bug dengan Git Bisect

Kasus umum: Pada rilis versi `v2.4.0` sebulan lalu, fungsi ekspor PDF berjalan sempurna. Namun pada rilis `v2.5.0` hari ini, fungsi ekspor PDF rusak dan menampilkan halaman kosong. Ada 150 commit di antara kedua rilis tersebut.

Alih-alih memeriksa 150 commit satu per satu, **Git Bisect** menggunakan pencarian biner logaritmik ($O(\log n)$), yang berarti Git hanya memerlukan maksimal 7 hingga 8 langkah pengujian untuk menemukan commit biang kerok secara pasti.

### Langkah Memulai Bisect:

1. Mulai sesi pelacakan:
   ```bash
   git bisect start
   ```

2. Tandai commit saat ini sebagai commit rusak (*bad*):
   ```bash
   git bisect bad
   ```

3. Beritahu Git tag atau hash commit lama yang Anda ketahui berjalan normal (*good*):
   ```bash
   git bisect good v2.4.0
   ```

Git akan menghitung titik tengah (misalnya commit ke-75) dan secara otomatis melakukan *checkout* ke titik tersebut:

```text
Bisecting: 75 revisions left to test after this (roughly 6 steps)
[c3d4e5f...] refactor: migrasi modul autentikasi
```

### Langkah Pengujian:
Uji aplikasi Anda (jalankan unit test atau buka peramban).
- Jika pada titik ini fungsi masih normal, ketik:
  ```bash
  git bisect good
  ```
- Jika fungsi sudah rusak, ketik:
  ```bash
  git bisect bad
  ```

Git akan terus membagi sisa commit menjadi dua hingga akhirnya mencetak laporan presisi:

```text
7a8b9c0d1e2f3g4h is the first bad commit
Author: Developer X <dev@company.com>
Date:   Wed Sep 24 14:22:01 2026 +0700

    refactor(pdf): update parser library to v3
```

Setelah menemukan pelakunya, akhiri sesi bisect untuk kembali ke branch kerja asal:

```bash
git bisect reset
```

---

## 3. Otomatisasi Penuh: Git Bisect Run

Jika Anda memiliki script test otomatis (misalnya `npm test`), Anda bahkan tidak perlu menguji manual di setiap langkah. Berikan script test tersebut ke Git:

```bash
git bisect start HEAD v2.4.0
git bisect run npm test
```

Git akan berpindah commit secara otonom, mengeksekusi test, dan dalam beberapa detik langsung menunjuk commit yang menggagalkan pengetesan tanpa intervensi manusia sedikit pun.

---

## Kesimpulan

Menguasai Interactive Rebase dan Git Bisect mengubah cara Anda berinteraksi dengan riwayat kode. Anda tidak hanya menjadi pengembang yang menulis kode bersih, tetapi juga insinyur yang tanggap membedah dan menyelesaikan anomali sistem secara sistematis.
