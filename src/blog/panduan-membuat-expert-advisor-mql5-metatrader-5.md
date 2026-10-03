---
title: "Panduan Membuat Expert Advisor MQL5 di MetaTrader 5 untuk Pemula"
slug: "panduan-membuat-expert-advisor-mql5-metatrader-5"
date: "2026-09-28"
author: "Wahid Alimudin"
category: "MQL5 & Algo Trading"
tags: ["MQL5", "MetaTrader 5", "Algorithmic Trading", "Expert Advisor", "Trading Robot"]
summary: "Pelajari langkah terstruktur mengembangkan Expert Advisor (EA) MetaTrader 5 menggunakan bahasa MQL5, mulai dari struktur event handler OnInit, OnTick, hingga manajemen risiko lot dan stop loss."
readingTime: "7 menit baca"
---

# Panduan Membuat Expert Advisor MQL5 di MetaTrader 5 untuk Pemula

Mengembangkan robot trading atau **Expert Advisor (EA)** di platform MetaTrader 5 menggunakan bahasa MQL5 memberikan keunggulan eksekusi algoritma yang presisi tanpa pengaruh emosi manusia. MetaTrader 5 menyediakan engine backtesting multi-thread yang cepat serta dukungan struktur objek berorientasi (OOP) modern.

Dalam panduan teknis ini, kita akan membahas arsitektur dasar sebuah Expert Advisor MQL5, memahami siklus hidup event penting, dan menulis kode EA sederhana yang dilengkapi manajemen risiko (Stop Loss dan Take Profit).

---

## 1. Memahami Struktur Utama Program MQL5

Setiap Expert Advisor di MQL5 bekerja berbasis *event-driven architecture*. MetaTrader 5 akan memanggil fungsi bawaan tertentu ketika terjadi kejadian di pasar atau di terminal:

- `OnInit()`: Dieksekusi satu kali saat EA pertama kali dipasang ke chart atau terminal dimulai. Digunakan untuk inisialisasi variabel, indikator handle, dan validasi akun.
- `OnDeinit(const int reason)`: Dipanggil saat EA dilepas dari chart, chart ditutup, atau timeframe diganti. Berguna untuk membersihkan memori dan menghapus objek chart.
- `OnTick()`: Fungsi paling vital yang dijalankan setiap kali terjadi perubahan harga baru (tick data) untuk instrumen pair aktif. Logika masuk pasar (entry), keluar (exit), dan trailing stop diletakkan di sini.

```mql5
//+------------------------------------------------------------------+
//|                                              SimpleMaCrossEA.mq5 |
//|                                  Copyright 2026, Wahid Alimudin  |
//|                                    https://wahidalimudin.web.id  |
//+------------------------------------------------------------------+
#property copyright "Wahid Alimudin"
#property link      "https://wahidalimudin.web.id"
#property version   "1.00"

// Include library trading standar MQL5
#include <Trade\Trade.mqh>

// Parameter input yang dapat disesuaikan pengguna
input group "=== Parameter Trading ==="
input double InpLotSize       = 0.01;      // Ukuran Lot Transaksi
input int    InpStopLoss      = 150;       // Stop Loss (dalam Points)
input int    InpTakeProfit    = 300;       // Take Profit (dalam Points)
input ulong  InpMagicNumber   = 882026;    // Magic Number Unik EA

// Instance trade object
CTrade trade;
```

---

## 2. Inisialisasi dan Validasi Akun di OnInit()

Sebelum menjalankan logika strategi, selalu validasi kondisi akun dan atur identitas pesanan (Magic Number). Magic Number memastikan transaksi EA ini tidak bercampur dengan transaksi manual atau EA lain pada akun yang sama.

```mql5
int OnInit()
{
   // Atur magic number dan deviasi slippage maksimal
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(10);
   trade.SetTypeFilling(ORDER_FILLING_IOC);

   Print("SimpleMaCrossEA berhasil diinisialisasi pada symbol: ", _Symbol);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   Print("EA dinonaktifkan. Alasan kode: ", reason);
}
```

---

## 3. Menghitung Harga dan Menempatkan Order di OnTick()

Pada fungsi `OnTick()`, kita memeriksa apakah sudah ada posisi aktif yang dibuka oleh EA kita. Jika belum ada posisi terbuka, kita dapat memeriksa sinyal beli atau jual.

Berikut contoh penempatan posisi Buy dengan perhitungan Stop Loss dan Take Profit yang aman:

```mql5
void OnTick()
{
   // Periksa apakah sudah ada posisi terbuka dengan Magic Number ini
   if(PositionsTotal() > 0)
   {
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         if(PositionGetTicket(i) > 0)
         {
            if(PositionGetString(POSITION_SYMBOL) == _Symbol &&
               PositionGetInteger(POSITION_MAGIC) == InpMagicNumber)
            {
               // Posisi masih aktif, lewati eksekusi baru
               return;
            }
         }
      }
   }

   // Ambil harga penawaran saat ini (Ask dan Bid)
   MqlTick currentTick;
   if(!SymbolInfoTick(_Symbol, currentTick))
   {
      Print("Gagal mengambil data harga tick terkini.");
      return;
   }

   double askPrice = currentTick.ask;
   double pointSize = SymbolInfoDouble(_Symbol, SYMBOL_POINT);

   // Hitung nilai Stop Loss dan Take Profit
   double slPrice = askPrice - (InpStopLoss * pointSize);
   double tpPrice = askPrice + (InpTakeProfit * pointSize);

   // Contoh eksekusi posisi BUY
   // Catatan: Pada implementasi riil, tambahkan kondisi filter indikator teknikal
   bool result = trade.Buy(
      InpLotSize,
      _Symbol,
      askPrice,
      slPrice,
      tpPrice,
      "SimpleMaCross EA Buy"
   );

   if(result)
   {
      Print("Order BUY berhasil dieksekusi pada harga: ", askPrice);
   }
   else
   {
      Print("Order BUY gagal. Error kode: ", trade.ResultRetcode());
   }
}
```

---

## 4. Praktik Terbaik Manajemen Risiko (Risk Management)

Beberapa prinsip mutlak yang wajib dipatuhi saat merancang Expert Advisor:

1. **Gunakan Dynamic Lot Sizing**: Jangan selalu gunakan fixed lot 0.01 jika saldo modal bertambah. Buat fungsi kalkulasi lot berdasarkan persentase risiko modal per transaksi (contoh: maksimal 1% hingga 2% dari balance).
2. **Perhatikan Jenis Filling Order Broker**: Setiap broker MetaTrader 5 memiliki aturan execution filling yang berbeda (`ORDER_FILLING_FOK`, `ORDER_FILLING_IOC`, atau `ORDER_FILLING_RETURN`).
3. **Uji pada Strategy Tester dengan Real Ticks**: Lakukan backtest dengan mode *Every tick based on real ticks* selama minimal 1 sampai 2 tahun data riwayat untuk melihat ketahanan drawndown algoritma Anda.

---

## Kesimpulan

Membangun Expert Advisor MQL5 yang andal membutuhkan pemahaman mendalam tentang event terminal MT5 serta kedisiplinan mengelola risiko lot. Dengan memanfaatkan class bawaan `CTrade`, kode Anda menjadi lebih ringkas, terstruktur, dan mudah dipelihara.
