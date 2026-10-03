---
title: "Panduan Optimasi Parameter Expert Advisor Menggunakan Strategy Tester MT5"
slug: "optimasi-backtest-strategy-tester-metatrader-5"
date: "2026-09-25"
author: "Wahid Alimudin"
category: "MQL5 & Algo Trading"
tags: ["MQL5", "MetaTrader 5", "Strategy Tester", "Backtesting", "Algorithmic Trading"]
summary: "Teknik melakukan optimasi parameter EA di Strategy Tester MT5 dengan Fast Genetic Algorithm, menghindari jebakan curve fitting, dan validasi dengan Forward Test."
readingTime: "7 menit baca"
---

# Panduan Optimasi Parameter Expert Advisor Menggunakan Strategy Tester MT5

Salah satu keunggulan terbesar MetaTrader 5 dibanding pendahulunya adalah mesin **Strategy Tester** 64-bit yang mendukung pemrosesan paralel multi-thread dan komputasi awan (MQL5 Cloud Network). Namun, optimasi parameter tanpa metode yang benar sering kali berujung pada jebakan **curve-fitting** (overfitting), di mana robot menghasilkan profit luar biasa pada data masa lalu namun langsung gagal saat diterapkan di akun riil.

Artikel ini membahas metodologi pengujian kuantitatif untuk menghasilkan parameter trading yang tahan banting.

---

## 1. Pemilihan Mode Model Eksekusi Data

Di jendela Strategy Tester MT5, Anda akan menemukan beberapa pilihan pemodelan tick:

1. **Every tick based on real ticks (Paling Akurat)**: Menggunakan data tick historis nyata yang direkam oleh server broker, termasuk fluktuasi floating spread. Selalu gunakan mode ini untuk pengujian final strategi scalping dan intraday.
2. **Every tick (Kalkulasi Matematis)**: Menghasilkan tick sintetis berdasarkan candle M1. Cepat, namun kurang akurat untuk strategi yang sangat sensitif terhadap spread.
3. **Open prices only**: Hanya mengevaluasi candle baru pada pembukaan harga. Sangat berguna untuk screening cepat pada strategi yang hanya mengeksekusi order di awal bar.

---

## 2. Menggunakan Algoritma Genetika Cepat (Fast Genetic Algorithm)

Ketika Anda memiliki 5 parameter dengan ribuan kombinasi, pengujian menyeluruh (Slow complete algorithm) bisa memakan waktu berminggu-minggu.

Aktifkan **Fast Genetic Based Algorithm**. Algoritma ini meniru seleksi alam, di mana kombinasi parameter terbaik pada generasi pertama disilangkan untuk menghasilkan generasi berikutnya.

### Kriteria Kustomisasi Optimasi:
Jangan hanya mengejar laba bersih maksimal (*Balance Max*). Pilihlah parameter kriteria yang mempertimbangkan stabilitas:
- **Complex Criterion Max**: Menggabungkan Sharpe Ratio, Recovery Factor, dan drawdown.
- **Recovery Factor Max**: Rasio antara total keuntungan bersih dibagi dengan nilai drawdown maksimal. Angka di atas 3.0 menandakan strategi yang tangguh.
- **Sharpe Ratio Max**: Mengukur konsistensi pertumbuhan equity terhadap volatilitas risiko.

---

## 3. Menghindari Curve-Fitting dengan Forward Testing

Curve-fitting terjadi ketika parameter EA disetel terlalu spesifik mengikuti noise acak pada riwayat harga masa lalu.

Untuk mencegahnya, bagi periode waktu data Anda menjadi dua:
1. **In-Sample Period (Misal 2023 - 2025)**: Digunakan untuk menjalankan proses optimasi algoritma genetika.
2. **Out-of-Sample / Forward Test Period (Misal 2026)**: Periode waktu yang sama sekali belum pernah dilihat oleh algoritma.

Jika hasil pengujian pada periode Forward Test tetap menunjukkan kurva equity yang naik dan drawdown yang stabil, maka logika strategi memiliki ketahanan pasar yang valid.

---

## 4. Format Input Parameter yang Efisien di Kode MQL5

Gunakan keyword `input group` dan berikan batas step yang masuk akal pada file `.mq5` Anda:

```mql5
// Kelompokkan parameter input agar rapi di panel tester
input group "--- Parameter Indikator EMA ---"
input int InpFastEmaPeriod = 14;   // Fast EMA (Start: 10, Step: 2, Stop: 30)
input int InpSlowEmaPeriod = 50;   // Slow EMA (Start: 40, Step: 5, Stop: 100)

input group "--- Filter Volatilitas ATR ---"
input int InpAtrPeriod     = 14;   // ATR Period
input double InpAtrMin     = 0.0010; // Minimum ATR Filter

input group "--- Manajemen Modal ---"
input double InpRiskPercent = 1.5; // Risiko Saldo per Transaksi (%)
```

---

## Kesimpulan

Optimasi parameter di Strategy Tester MetaTrader 5 bukan bertujuan mencari satu angka ajaib yang sempurna, melainkan mencari kelompok parameter yang berada pada zona stabil (plateau), bukan di puncak sempit yang mudah terhempas oleh perubahan rezim volatilitas pasar.
