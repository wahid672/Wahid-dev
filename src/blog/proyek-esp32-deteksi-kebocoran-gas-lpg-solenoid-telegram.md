---
title: "Proyek ESP32 Deteksi Kebocoran Gas LPG: Auto Shut-Off Solenoid Valve dan Notifikasi Telegram"
slug: "proyek-esp32-deteksi-kebocoran-gas-lpg-solenoid-telegram"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "Deteksi Gas LPG", "MQ-6", "Telegram Bot", "Solenoid Valve", "Smart Safety", "Hardware"]
summary: "Mencegah kebakaran dapur dan industri kuliner dengan sistem deteksi gas bocor ESP32 yang memotong pasokan gas secara otomatis via solenoid valve dan mengirimkan peringatan darurat ke Telegram."
readingTime: "6 menit baca"
---

Insiden ledakan tabung gas LPG dan kebakaran dapur di area perumahan, restoran, maupun kantin sekolah sering kali bermula dari kebocoran kecil pada selang regulator yang tidak disadari penghuni saat ruangan kosong di malam hari. Gas yang terperangkap di dalam ruangan tertutup akan mencapai batas ledak (*lower explosive limit*), sehingga percikan api saklar lampu saja sudah cukup untuk memicu ledakan dahsyat.

Alat alarm gas komersial yang beredar di pasaran umumnya hanya berbunyi nyaring di tempat. Jika tidak ada orang di rumah, alarm tersebut tidak dapat mencegah gas terus menyembur keluar dari tabung.

Proyek keselamatan cerdas (*smart safety system*) berbasis ESP32 ini menghadirkan aksi tanggap darurat aktif: tidak hanya mendeteksi gas LPG dan membunyikan sirine darurat, tetapi juga **secara fisik langsung memutus aliran gas dari tabung menggunakan katup solenoid elektrik (solenoid valve)** serta mengirimkan pesan peringatan prioritas tinggi ke bot Telegram pemilik rumah dalam hitungan detik.

---

## 1. Komponen Kunci Sistem Mitigasi Kebocoran Gas

Berikut daftar komponen yang dirancang untuk keselamatan maksimal:

1. **ESP32 NodeMCU**: Pemroses data dengan kemampuan eksekusi real-time dan konektivitas Wi-Fi.
2. **Sensor Gas MQ-6 (atau MQ-2)**: Sensor khusus yang memiliki sensitivitas tinggi terhadap gas propana dan butana (senyawa utama bahan bakar gas LPG).
3. **Emergency Gas Shut-Off Solenoid Valve 12V (Tipe Manipulator atau Brass Valve)**: Katup aktuator mekanis yang dipasang pada pipa saluran gas yang menutup seketika saat menerima pulsa listrik darurat.
4. **Modul Relay Optocoupler 12V/5V**: Pemicu tegangan untuk membuka/menutup katup solenoid.
5. **Active Buzzer 5V & High-Intensity Strobe LED Merah**: Indikator peringatan suara dan visual lokal agar orang di sekitar segera mengevakuasi diri dan tidak menyalakan api.
6. **Sensor Api (Flame Sensor IR)**: Mendeteksi percikan api aktif jika api sudah terlanjur menyala.

---

## 2. Diagram Alur Keselamatan Otomatis (Fail-Safe Protocol)

Sistem bekerja berdasarkan protokol keselamatan ketat:

1. **Pemindaian Kontinu (Frekuensi 100 ms)**: ESP32 membaca nilai konsentrasi gas dari pin analog sensor MQ-6 secara konstan.
2. **Kondisi Normal (PPM < 200)**: Lampu indikator hijau menyala, katup gas terbuka normal untuk kebutuhan memasak.
3. **Kondisi Peringatan Awal (PPM 200 - 450)**: Buzzer berbunyi bip pendek perlahan, sistem mengirimkan notifikasi waspada ke bot Telegram.
4. **Kondisi Darurat Kritis (PPM > 450 atau Api Terdeteksi)**:
   - **Tindakan Fisik 1**: Relay memicu katup solenoid 12V untuk **MENUTUP TOTAL** saluran pipa gas seketika.
   - **Tindakan Fisik 2**: Sirine lokal berbunyi keras tanpa henti dan LED darurat berkedip cepat.
   - **Tindakan Komunikasi**: Mengirimkan pesan darurat berulang ke grup Telegram pengelola: *"BAHAYA KRITIS: Terdeteksi kebocoran gas LPG di Dapur Utama! Katup gas telah diputus otomatis."*

---

## 3. Implementasi Kode ESP32 dengan Telegram Bot

Gunakan pustaka `UniversalTelegramBot` dan `ArduinoJson` untuk menangani notifikasi Telegram instan:

```cpp
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>

const char* ssid = "WIFI_DAPUR";
const char* password = "PASSWORD_WIFI";

// Konfigurasi Bot Telegram
#define BOT_TOKEN "123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
#define CHAT_ID "987654321" // Chat ID akun atau grup Telegram Anda

#define MQ6_PIN 35
#define FLAME_PIN 32
#define RELAY_SOLENOID_PIN 25
#define BUZZER_PIN 26
#define LED_ALERT_PIN 27

WiFiClientSecure secured_client;
UniversalTelegramBot bot(BOT_TOKEN, secured_client);

const int GAS_THRESHOLD_EMERGENCY = 1800; // Nilai ambang batas analog darurat
bool isGasShutOff = false;

void triggerEmergencyShutOff() {
  if (isGasShutOff) return; // Cegah pemutusan berulang

  // 1. Putus pasokan gas secara fisik via Solenoid Valve
  digitalWrite(RELAY_SOLENOID_PIN, HIGH);
  isGasShutOff = true;

  // 2. Nyalakan sirine lokal
  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(LED_ALERT_PIN, HIGH);

  // 3. Kirim pesan prioritas ke Telegram
  String message = "PERINGATAN DARURAT KEBAKARAN/GAS!\n\n";
  message += "Lokasi: Dapur / Area Masak Utama\n";
  message += "Status: Kebocoran Gas LPG Terdeteksi Melebihi Batas Aman!\n";
  message += "Tindakan Otomatis: Katup Solenoid telah MEMUTUS aliran gas tabung.\n";
  message += "Langkah Wajib: Jangan nyalakan saklar lampu! Buka seluruh ventilasi jendela segera.";

  bot.sendMessage(CHAT_ID, message, "Markdown");
  Serial.println("Peringatan darurat berhasil dikirim ke Telegram!");
}

void setup() {
  Serial.begin(115200);
  pinMode(MQ6_PIN, INPUT);
  pinMode(FLAME_PIN, INPUT);

  pinMode(RELAY_SOLENOID_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_ALERT_PIN, OUTPUT);

  // Set kondisi awal: Gas mengalir normal (Relay OFF), alarm mati
  digitalWrite(RELAY_SOLENOID_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_ALERT_PIN, LOW);

  WiFi.begin(ssid, password);
  secured_client.setCACert(TELEGRAM_CERTIFICATE_ROOT); // Gunakan root CA Telegram

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nSistem Deteksi Gas LPG Aktif & Terhubung ke Telegram.");
}

void loop() {
  int gasValue = analogRead(MQ6_PIN);
  int flameStatus = digitalRead(FLAME_PIN); // Active LOW pada kebanyakan sensor api

  Serial.print("Nilai Sensor Gas MQ-6: ");
  Serial.println(gasValue);

  // Evaluasi kondisi bahaya
  if (gasValue > GAS_THRESHOLD_EMERGENCY || flameStatus == LOW) {
    Serial.println("KONDISI BAHAYA TERDETEKSI!");
    triggerEmergencyShutOff();
  }

  delay(200);
}
```

---

## 4. Tips Pemasangan Sensor Gas LPG di Lapangan

1. **Posisi Ketinggian Sensor**: Gas LPG (propana & butana) memiliki massa jenis yang lebih berat daripada udara biasa (*heavy gas*). Oleh karena itu, pasang sensor MQ-6 di dinding pada ketinggian **20 - 30 cm di atas lantai**, tepat di dekat tabung gas atau kompor, bukan di langit-langit atap.
2. **Proses Pemanasan Awal (*Pre-Heating*)**: Sensor keluarga MQ membutuhkan waktu pemanasan awal elemen pemanas internal (*heater burn-in*) sekitar 24-48 jam saat pertama kali dinyalakan untuk mendapatkan kestabilan pembacaan analog yang bebas *false alarm*.
3. **Penyediaan Tombol Reset Manual**: Siapkan tombol fisik *push-button* di boks panel untuk mereset status katup solenoid kembali ke posisi normal setelah teknisi selesai memeriksa dan memastikan area dapur sudah aman dari sisa gas.
