---
title: "Cara Mengimplementasikan Trailing Stop Otomatis pada Expert Advisor MQL5"
slug: "cara-menggunakan-trailing-stop-mql5-metatrader-5"
date: "2026-10-02"
author: "Wahid Alimudin"
category: "MQL5 & Algo Trading"
tags: ["MQL5", "MetaTrader 5", "Trailing Stop", "Expert Advisor", "Risk Management"]
summary: "Pelajari logika kalkulasi trailing stop otomatis dan trailing step pada posisi aktif MetaTrader 5 menggunakan CTrade dan PositionModify untuk mengunci profit yang sedang berjalan."
readingTime: "6 menit baca"
---

# Cara Mengimplementasikan Trailing Stop Otomatis pada Expert Advisor MQL5

Dalam trading algoritmik, melindungi keuntungan yang sedang mengambang (floating profit) sama pentingnya dengan membatasi kerugian. Fitur **Trailing Stop** memungkinkan garis Stop Loss bergeser maju secara otomatis mengikuti pergerakan harga pasar yang menguntungkan.

Artikel ini membahas kalkulasi trailing stop dinamis pada MQL5, penerapan trailing step, dan cara memodifikasi posisi menggunakan class bawaan `CTrade`.

---

## 1. Konsep Jarak Poin dan Trailing Step

Trailing Stop tidak boleh dimodifikasi pada setiap perubahan satu tick harga karena akan membebani server broker (*excessive order modification*). Oleh karena itu, kita menggunakan dua parameter:

- **Trailing Stop (Points)**: Jarak minimum antara harga saat ini dengan garis Stop Loss baru.
- **Trailing Step (Points)**: Jarak pergerakan harga minimum sebelum Stop Loss diubah kembali.

Misalnya pada pasangan mata uang EURUSD, 1 pip setara dengan 10 points pada akun 5 digit.

---

## 2. Fungsi Implementasi Trailing Stop di MQL5

Berikut fungsi siap pakai yang dapat Anda panggil pada event `OnTick()`:

```mql5
#include <Trade\Trade.mqh>
CTrade trade;

input group "=== Konfigurasi Trailing Stop ==="
input int InpTrailingStop = 200; // Jarak Trailing Stop (dalam Points)
input int InpTrailingStep = 50;  // Trailing Step (dalam Points)
input ulong InpMagicNumber = 882026;

void ApplyTrailingStop()
{
   double point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
   int digits   = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;

      // Filter berdasarkan symbol chart dan magic number
      if(PositionGetString(POSITION_SYMBOL) != _Symbol ||
         PositionGetInteger(POSITION_MAGIC) != InpMagicNumber)
      {
         continue;
      }

      ENUM_POSITION_TYPE posType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      double currentSL = PositionGetDouble(POSITION_SL);
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);

      MqlTick tick;
      if(!SymbolInfoTick(_Symbol, tick)) continue;

      if(posType == POSITION_TYPE_BUY)
      {
         // Harga Bid digunakan untuk mengukur posisi BUY
         if(tick.bid - openPrice > InpTrailingStop * point)
         {
            double newSL = NormalizeDouble(tick.bid - (InpTrailingStop * point), digits);

            // Geser hanya jika SL baru lebih tinggi dari SL lama + Trailing Step
            if(newSL > currentSL + (InpTrailingStep * point))
            {
               double currentTP = PositionGetDouble(POSITION_TP);
               trade.PositionModify(ticket, newSL, currentTP);
               Print("Trailing Stop BUY diperbarui ke ticket #", ticket, " SL Baru: ", newSL);
            }
         }
      }
      else if(posType == POSITION_TYPE_SELL)
      {
         // Harga Ask digunakan untuk mengukur posisi SELL
         if(openPrice - tick.ask > InpTrailingStop * point)
         {
            double newSL = NormalizeDouble(tick.ask + (InpTrailingStop * point), digits);

            // Geser hanya jika SL baru lebih rendah dari SL lama (atau SL masih 0)
            if(currentSL == 0 || newSL < currentSL - (InpTrailingStep * point))
            {
               double currentTP = PositionGetDouble(POSITION_TP);
               trade.PositionModify(ticket, newSL, currentTP);
               Print("Trailing Stop SELL diperbarui ke ticket #", ticket, " SL Baru: ", newSL);
            }
         }
      }
   }
}
```

---

## 3. Menghindari Error Trade RETCODE 10016 (Invalid Stops)

Kesalahan umum yang sering ditemui pengembang pemula adalah error `TRADE_RETCODE_INVALID_STOPS`. Hal ini terjadi jika jarak Stop Loss baru terlalu dekat dengan harga pasar saat ini melebihi ambang batas `SYMBOL_TRADE_STOPS_LEVEL`.

Pastikan Anda selalu memeriksa nilai stops level sebelum mengirim permintaan modifikasi:

```mql5
long stopsLevel = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
double minDistance = stopsLevel * point;

if(MathAbs(tick.bid - newSL) < minDistance)
{
   // Jangan kirim order modifikasi jika jarak terlalu dekat dengan batas broker
   return;
}
```

---

## Kesimpulan

Menerapkan Trailing Stop dengan verifikasi `SYMBOL_TRADE_STOPS_LEVEL` dan filter `Trailing Step` menjamin posisi trading Anda terlindungi saat pasar bergerak fluktuatif tanpa melanggar batasan frekuensi request dari broker.
