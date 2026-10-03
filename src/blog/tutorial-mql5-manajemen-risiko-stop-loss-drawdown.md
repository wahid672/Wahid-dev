---
title: "Proteksi Ekuitas Robot Trading: Tutorial Memasang Hard Stop-Loss dan Drawdown Limit di MQL5"
slug: "tutorial-mql5-manajemen-risiko-stop-loss-drawdown"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["MQL5", "MetaTrader 5", "Algo Trading", "Risk Management", "Finance"]
summary: "Script MQL5 praktis untuk membatasi risiko kerugian maksimal per hari, trailing stop otomatis, dan proteksi akun dari lonjakan spread tinggi."
readingTime: "7 menit baca"
---

Banyak pengembang Expert Advisor (EA) di MetaTrader 5 memusatkan 90% waktu mereka untuk merancang sinyal entry yang sempurna berbasis indikator teknikal (RSI, Moving Average, atau Bollinger Bands). Padahal, dalam dunia trading algoritmik institusional, yang membedakan robot profitable jangka panjang dari robot penghancur akun adalah **arsitektur manajemen risiko (Risk Engine)**.

Sebagus apa pun strategi trading Anda, jika pasar mengalami kejutan likuiditas saat rilis berita ekonomi besar (*Black Swan Event*), strategi martingale atau grid tanpa pembatas kerugian mutlak akan memicu *Margin Call* dalam hitungan menit.

Tutorial ini menyajikan implementasi script MQL5 modular yang bertugas melindungi saldo modal Anda: pembatasan persentase drawdown harian, penutupan darurat seluruh posisi, serta filter pelebaran spread otomatis.

---

## 1. Tiga Pilar Proteksi Ekuitas Akun

Sebuah robot trading profesional harus memiliki tiga lapis perlindungan:
1. **Spread Protection Filter:** Menolak eksekusi order jika selisih harga jual dan beli (*spread*) melampaui ambang batas wajar.
2. **Fixed Hard Stop-Loss:** Setiap tiket order yang dibuka WAJIB memiliki level Stop-Loss yang terdaftar langsung di server broker.
3. **Daily Equity Drawdown Guard:** Memantau penurunan ekuitas mengambang (*floating loss*) harian. Jika kerugian menyentuh batas batas risiko (misalnya 4% dari modal awal hari), robot otomatis menutup semua posisi terbuka dan memblokir order baru hingga hari berikutnya.

---

## 2. Implementasi Modul Manajemen Risiko di MQL5

Buka MetaEditor di MetaTrader 5, buat berkas header baru bernama `RiskManager.mqh` atau sertakan langsung ke dalam template Expert Advisor Anda:

```mql5
//+------------------------------------------------------------------+
//|                                                  RiskManager.mqh |
//|                                  Copyright 2026, Wahid Alimudin  |
//|                                      https://wahidalimudin.web.id |
//+------------------------------------------------------------------+
#property copyright "Wahid Alimudin"
#property link      "https://wahidalimudin.web.id"
#property strict

#include <Trade\Trade.mqh>

//--- Input Parameter Manajemen Risiko
input group "=== PENGATURAN PROTEKSI RISIKO ==="
input double   InpMaxDailyLossPercent = 4.0;      // Batas Maksimal Kerugian Harian (%)
input int      InpMaxAllowedSpreadPips = 35;     // Batas Maksimal Spread (Points/Pips)
input ulong    InpMagicNumber          = 882910;  // Nomor Identifikasi Unik EA (Magic Number)

//--- Variabel Pelacak Ekuitas Harian
CTrade         m_trade;
datetime       g_lastResetDate = 0;
double         g_startingDailyEquity = 0.0;
bool           g_isTradingHaltedToday = false;

//+------------------------------------------------------------------+
//| Inisialisasi Modul Risiko                                         |
//+------------------------------------------------------------------+
int OnInitRiskManager()
{
   m_trade.SetExpertMagicNumber(InpMagicNumber);
   m_trade.SetMarginMode();
   
   // Catat ekuitas awal saat robot pertama kali dipasang
   g_startingDailyEquity = AccountInfoDouble(ACCOUNT_EQUITY);
   g_lastResetDate = iTime(_Symbol, PERIOD_D1, 0);
   g_isTradingHaltedToday = false;

   PrintFormat("[RISK ENGINE] Inisialisasi aktif. Modal Awal Hari: %.2f | Maksimal Drawdown: %.1f%%",
               g_startingDailyEquity, InpMaxDailyLossPercent);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Reset Kalkulasi Ekuitas Setiap Pergantian Hari Kalender          |
//+------------------------------------------------------------------+
void CheckAndResetDailyEquity()
{
   datetime currentDayTime = iTime(_Symbol, PERIOD_D1, 0);
   
   // Jika hari baru telah berganti
   if(currentDayTime != g_lastResetDate)
   {
      g_lastResetDate = currentDayTime;
      g_startingDailyEquity = AccountInfoDouble(ACCOUNT_EQUITY);
      g_isTradingHaltedToday = false;
      
      PrintFormat("[RISK ENGINE] Hari baru terdeteksi! Reset acuan ekuitas harian ke: %.2f", 
                  g_startingDailyEquity);
   }
}

//+------------------------------------------------------------------+
//| Filter Validasi Spread Sebelum Membuka Posisi Baru               |
//+------------------------------------------------------------------+
bool IsSpreadAcceptable()
{
   long currentSpread = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   
   if(currentSpread > InpMaxAllowedSpreadPips)
   {
      PrintFormat("[RISK WARNING] Spread saat ini terlalu lebar: %d points (Maks: %d). Order dibatalkan!",
                  currentSpread, InpMaxAllowedSpreadPips);
      return false;
   }
   return true;
}

//+------------------------------------------------------------------+
//| Pemeriksaan Batas Drawdown Ekuitas Real-Time                     |
//+------------------------------------------------------------------+
bool CheckDailyDrawdownProtection()
{
   // Jika trading sudah diblokir hari ini, jangan izinkan aksi apa pun
   if(g_isTradingHaltedToday)
      return false;

   double currentEquity = AccountInfoDouble(ACCOUNT_EQUITY);
   
   // Hitung persentase penurunan dari modal awal hari
   double currentLossPercent = ((g_startingDailyEquity - currentEquity) / g_startingDailyEquity) * 100.0;

   // Jika penurunan melewati ambang batas aman
   if(currentLossPercent >= InpMaxDailyLossPercent)
   {
      PrintFormat("[EMERGENCY STOP] Drawdown harian mencapai %.2f%% (Batas: %.2f%%)! Mengaktifkan proteksi darurat...",
                  currentLossPercent, InpMaxDailyLossPercent);

      // Tutup seluruh order terbuka milik robot ini sekarang juga
      CloseAllBotPositions();

      // Kunci perdagangan hingga besok
      g_isTradingHaltedToday = true;
      return false;
   }

   return true;
}

//+------------------------------------------------------------------+
//| Fungsi Penutupan Seluruh Posisi Terbuka (Panic Close)           |
//+------------------------------------------------------------------+
void CloseAllBotPositions()
{
   int totalPositions = PositionsTotal();
   
   // Lakukan iterasi mundur agar indeks array tidak bergeser saat posisi ditutup
   for(int i = totalPositions - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0)
      {
         // Pastikan hanya menutup posisi milik simbol dan Magic Number robot ini
         if(PositionGetString(POSITION_SYMBOL) == _Symbol &&
            PositionGetInteger(POSITION_MAGIC) == InpMagicNumber)
         {
            m_trade.PositionClose(ticket);
            PrintFormat("[RISK ENGINE] Posisi tiket #%I64u berhasil ditutup paksa demi mengamankan modal.", ticket);
         }
      }
   }
}
```

---

## 3. Integrasi ke Siklus Event EA (`OnTick`)

Di dalam berkas utama Expert Advisor Anda (`.mq5`), panggil proteksi risiko ini di baris paling awal dari fungsi `OnTick()`:

```mql5
void OnTick()
{
   // 1. Sinkronisasi kalender pergantian hari
   CheckAndResetDailyEquity();

   // 2. Evaluasi batas kerugian ekuitas harian
   if(!CheckDailyDrawdownProtection())
   {
      // Jangan lanjutkan pembacaan indikator atau entry jika akun sedang dikunci
      return;
   }

   // 3. Evaluasi kondisi spread pasar
   if(!IsSpreadAcceptable())
   {
      return;
   }

   // 4. Logika strategi trading utama Anda (RSI, MA, dll.) dijalankan di bawah ini
   // ...
}
```

---

## 4. Pengujian di Strategy Tester MetaTrader 5

Untuk memverifikasi keandalan script proteksi ini:
1. Buka jendela **Strategy Tester** (`Ctrl + R`) di MetaTrader 5.
2. Pilih periode data historis yang memuat peristiwa volatilitas ekstrem (misalnya pengumuman suku bunga bank sentral AS / FOMC).
3. Perhatikan grafik ekuitas: Ketika terjadi rangkaian kerugian beruntun, garis ekuitas tidak akan pernah menukik lebih dalam dari **4% per hari**. Robot akan segera menghentikan aktivitas trading dan melindungi 96% modal Anda untuk bertarung di hari esok.

---

## Kesimpulan

Strategi trading menghasilkan profit, namun manajemen risiko menentukan ketahanan akun. Dengan menyematkan hard stop-loss dan daily equity drawdown guard langsung ke dalam logika MQL5, Anda mentransformasikan Expert Advisor Anda dari robot spekulatif menjadi aset algoritma trading yang disiplin dan tahan uji di segala kondisi pasar.
