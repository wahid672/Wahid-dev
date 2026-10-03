---
title: "Panduan Optimasi Baterai ESP32 dengan Deep Sleep dan Timer Wakeup untuk Proyek IoT"
slug: "tutorial-esp32-deep-sleep-manajemen-daya-baterai"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["ESP32", "IoT", "Hardware", "Embedded Systems", "Arduino"]
summary: "Cara menghemat konsumsi daya mikrokontroler ESP32 dari 150mA menjadi di bawah 10uA menggunakan mode deep sleep dan RTC timer wakeup."
readingTime: "6 menit baca"
---

Mikrokontroler ESP32 adalah pilihan terpopuler untuk perangkat Internet of Things (IoT) berkat modul Wi-Fi dan Bluetooth terintegrasi serta harga yang terjangkau. Namun, ketika perangkat harus dipasang di lapangan tanpa colokan listrik dan hanya ditenagai baterai Lithium 18650, ESP32 memiliki reputasi sebagai modul yang boros daya.

Dalam kondisi aktif dengan radio Wi-Fi menyala, ESP32 mengonsumsi arus sekitar **130 mA hingga 240 mA**. Dengan kapasitas baterai 18650 standar (2500 mAh), perangkat akan mati total hanya dalam waktu kurang dari 20 jam.

Dengan menerapkan teknik **Deep Sleep**, kita dapat mematikan CPU utama, modul Wi-Fi, dan Bluetooth, menyisakan hanya unit Real-Time Clock (RTC) yang berjalan dengan arus di bawah **10 mikroampere (µA)**. Hasilnya, baterai yang sama dapat bertahan berbulan-bulan hingga bertahun-tahun.

---

## 1. Memahami Siklus Daya: Active vs Deep Sleep

Dalam mode Deep Sleep:
- Core CPU (Xtensa dual-core) dinonaktifkan sepenuhnya.
- Memori RAM sistem utama dimatikan (variabel reguler di memori akan terhapus saat tidur).
- RTC Controller, RTC Peripherals, dan ULP (Ultra Low Power) Coprocessor tetap aktif.
- Memori khusus bernama **RTC Slow Memory (8 KB)** tetap terjaga dayanya, memungkinkan kita menyimpan data counter penting antar siklus tidur.

---

## 2. Implementasi Timer Wakeup di Arduino IDE / PlatformIO

Skenario paling umum: Perangkat IoT membaca sensor suhu dan kelembaban, mengirimkan data ke broker MQTT via Wi-Fi selama 5 detik, lalu tidur selama 15 menit.

Berikut adalah kode firmware C++ lengkap dan teruji:

```cpp
#include <Arduino.h>
#include <WiFi.h>

// Definisi durasi tidur dalam mikrodetik (1 detik = 1.000.000 mikrodetik)
#define FAKTOR_KONVERSI_US 1000000ULL
#define DURASI_TIDUR_DETIK 900 // 15 menit

// Variabel dengan atribut RTC_DATA_ATTR disimpan di RTC Memory
// Nilainya TIDAK AKAN HILANG saat ESP32 terbangun dari Deep Sleep
RTC_DATA_ATTR int nomorSiklusBoot = 0;

const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI";

void sambungkanWiFiDanKirimData() {
  Serial.print("Menghubungkan ke Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  unsigned long waktuMulai = millis();
  // Batas waktu tunggu (timeout) koneksi 8 detik agar tidak membuang baterai
  while (WiFi.status() != WL_CONNECTED && millis() - waktuMulai < 8000) {
    delay(200);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi Terhubung!");
    // Simulasi pengiriman data telemetri ke server
    Serial.printf("Mengirimkan data batch siklus ke-%d ke Cloud API...\n", nomorSiklusBoot);
    delay(500); // Simulasi request HTTP/MQTT
  } else {
    Serial.println("\nTimeout koneksi Wi-Fi. Menunda pengiriman ke siklus berikutnya.");
  }

  // Matikan modul Wi-Fi sebelum masuk ke mode tidur untuk menghemat daya
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
}

void setup() {
  Serial.begin(115200);
  delay(100);

  // Tambahkan pencatat siklus boot
  nomorSiklusBoot++;
  Serial.println("\n==================================");
  Serial.printf("ESP32 Bangun! Nomor Siklus: %d\n", nomorSiklusBoot);

  // Periksa alasan bangun (Wakeup Reason)
  esp_sleep_wakeup_cause_t alasanBangun = esp_sleep_get_wakeup_cause();
  if (alasanBangun == ESP_SLEEP_WAKEUP_TIMER) {
    Serial.println("Bangun karena alarm Timer RTC tercapai.");
  } else {
    Serial.println("Bangun pertama kali (Power-on Reset / Tombol).");
  }

  // Jalankan tugas utama perangkat
  sambungkanWiFiDanKirimData();

  // Konfigurasikan timer RTC sebagai pemicu bangun
  esp_sleep_enable_timer_wakeup(DURASI_TIDUR_DETIK * FAKTOR_KONVERSI_US);

  Serial.printf("Memasuki mode Deep Sleep selama %d detik...\n", DURASI_TIDUR_DETIK);
  Serial.flush(); // Pastikan seluruh buffer serial terkirim sebelum tidur

  // Masuk ke Deep Sleep
  esp_deep_sleep_start();
}

void loop() {
  // Blok loop() tidak akan pernah dieksekusi karena ESP32 langsung tidur di akhir setup()
}
```

---

## 3. Kalkulasi Konsumsi Daya & Estimasi Masa Pakai Baterai

Mari hitung efisiensi energi secara matematis:

1. **Fase Aktif (5 detik):**
   Konsumsi rata-rata saat transmisi Wi-Fi: **150 mA**.
   Energi per jam: $(5 \text{ detik} / 3600) \times 150 \text{ mA} \approx 0.208 \text{ mAh}$.

2. **Fase Deep Sleep (895 detik / ~14.9 menit):**
   Konsumsi saat tidur: **10 µA (0.01 mA)**.
   Energi per jam: $(895 / 3600) \times 0.01 \text{ mA} \approx 0.0025 \text{ mAh}$.

3. **Total Konsumsi Arus Rata-rata per Siklus:**
   $\approx 0.21 \text{ mAh per jam}$.

Dengan baterai 18650 berkapasitas riil 2200 mAh (dihitung efisiensi 80% regulator daya):
$$\text{Masa Pakai} = \frac{2200 \times 0.8}{0.21} \approx 8.380 \text{ jam} \approx 349 \text{ hari (hampir 1 tahun!)}$$

---

## 4. Tips Tambahan Perangkat Keras (Hardware Level)

Mengoptimalkan software saja tidak cukup jika board development Anda memiliki kebocoran arus di level komponen:
1. **Pilih Chip Regulator Tegangan Efisien:** Board ESP32 generik sering memakai regulator LDO tipe AMS1117 yang memiliki arus bocor (*quiescent current*) tinggi (~5 mA). Gantilah modul regulator dengan chip LDO low-quiescent seperti **ME6211** atau **HT7333** yang hanya memakan arus 2 µA.
2. **Lepas LED Indikator Power:** Lampu LED kecil penanda daya yang menyala terus menerus membuang arus 2 mA hingga 4 mA tanpa henti. Cabut resistor pembatas LED tersebut pada board Anda.

---

## Kesimpulan

Dengan memadukan konfigurasi perangkat lunak Deep Sleep berbasis RTC Timer dan pemilihan komponen daya yang tepat, Anda dapat membangun simpul sensor IoT mandiri bertenaga baterai yang tahan beroperasi di remote area selama berbulan-bulan tanpa perawatan manual.
