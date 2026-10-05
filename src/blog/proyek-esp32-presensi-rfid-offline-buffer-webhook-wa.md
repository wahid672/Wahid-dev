---
title: "Proyek Mesin Presensi RFID ESP32: Offline Buffer SPIFFS dan Sinkronisasi Webhook WhatsApp"
slug: "proyek-esp32-presensi-rfid-offline-buffer-webhook-wa"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "RFID RC522", "Presensi Online", "IoT", "Webhook", "WhatsApp Gateway", "Hardware"]
summary: "Rancang bangun terminal presensi kartu RFID berbasis ESP32 yang kebal pemadaman internet dengan sistem offline buffer memori flash dan notifikasi real-time WhatsApp."
readingTime: "7 menit baca"
---

Sistem pencatatan kehadiran manual menggunakan tanda tangan kertas atau mesin sidik jari (*fingerprint*) konvensional kerap menghadapi kendala teknis di lapangan: sensor sidik jari kotor, antrean panjang saat jam masuk kantor, serta ketiadaan laporan seketika (*real-time*) kepada pihak manajemen atau orang tua santri di sekolah.

Masalah paling krusial lainnya adalah ketergantungan pada koneksi internet. Jika router Wi-Fi sekolah atau kantor mengalami gangguan, mesin presensi berbasis cloud murni sering kali gagal merekam data, menyebabkan data kehadiran karyawan atau santri hilang.

Melalui artikel ini, kita akan merancang sistem mesin tap kartu RFID mandiri menggunakan ESP32 dan modul RC522 yang dilengkapi fitur **Offline Buffer** (penyimpanan sementara di partisi flash LittleFS/SPIFFS saat internet mati) serta otomatis menyinkronkan data ke REST API server dan memicu webhook notifikasi WhatsApp saat koneksi internet pulih.

---

## 1. Arsitektur Alur Kerja Sistem (Workflow Architecture)

Sistem presensi ini bekerja dengan diagram alur logika berikut:

1. **Tap Kartu RFID**: Karyawan atau santri menempelkan kartu RFID (13.56 MHz Mifare) pada modul pembaca.
2. **Umpan Balik Visual & Audio**: Buzzer berbunyi bip pendek dan lampu LED indikator hijau menyala menandakan kartu terbaca.
3. **Pengecekan Status Koneksi Jaringan**:
   - **Jika Wi-Fi & Server Online**: ESP32 langsung mengirimkan payload HTTP POST JSON (UID Kartu, Timestamp, ID Mesin) ke endpoint server backend. Server mencatat kehadiran dan memicu API WhatsApp Gateway untuk mengirim pesan ke nomor wali santri.
   - **Jika Jaringan Offline**: ESP32 secara otomatis menyimpan payload log ke dalam berkas `offline_logs.csv` di memori flash internal (SPIFFS / LittleFS).
4. **Auto-Synchronization Engine**: Sebuah task FreeRTOS di latar belakang secara berkala memantau ketersediaan jaringan. Ketika koneksi internet terhubung kembali, seluruh antrean log yang tersimpan di flash memory dikirimkan secara berurutan (*FIFO*) ke server hingga bersih.

---

## 2. Skema Rangkaian Hardware

Koneksi modul RFID RC522 ke board ESP32 menggunakan antarmuka SPI standar:

- **SDA (SS)** disambungkan ke **GPIO 5**
- **SCK** disambungkan ke **GPIO 18**
- **MOSI** disambungkan ke **GPIO 23**
- **MISO** disambungkan ke **GPIO 19**
- **RST** disambungkan ke **GPIO 22**
- **GND** disambungkan ke **GND**
- **3.3V** disambungkan ke **Pin 3.3V** (Perhatian: modul RC522 bekerja pada tegangan 3.3V, jangan sambungkan ke 5V).
- **Buzzer Aktif**: Anoda ke **GPIO 4**, Katoda ke **GND**.
- **LED Hijau Status**: Anoda ke **GPIO 2** melalui resistor 220 Ohm, Katoda ke **GND**.

---

## 3. Implementasi Kode ESP32 dengan Buffer LittleFS

Gunakan kode program berikut untuk memastikan mesin presensi Anda kebal pemadaman sinyal internet:

```cpp
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <LittleFS.h>

#define SS_PIN 5
#define RST_PIN 22
#define BUZZER_PIN 4
#define LED_PIN 2

MFRC522 rfc(SS_PIN, RST_PIN);

const char* ssid = "WIFI_KANTOR";
const char* password = "PASSWORD_WIFI";
const char* serverApiUrl = "https://presensirfid.web.id/api/v1/tap";
const char* apiKey = "SECRET_DEVICE_TOKEN_123";

void triggerFeedback() {
  digitalWrite(LED_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(120);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
}

void appendOfflineLog(String uid) {
  File file = LittleFS.open("/offline_logs.txt", FILE_APPEND);
  if (file) {
    file.println(uid);
    file.close();
    Serial.println("Internet offline. Data disimpan ke LittleFS: " + uid);
  }
}

void syncOfflineLogs() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (!LittleFS.exists("/offline_logs.txt")) return;

  File file = LittleFS.open("/offline_logs.txt", FILE_READ);
  if (!file) return;

  String unsyncedContent = "";
  HTTPClient http;

  while (file.available()) {
    String uid = file.readStringUntil('\n');
    uid.trim();
    if (uid.length() > 0) {
      http.begin(serverApiUrl);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("X-Device-Key", apiKey);

      String payload = "{\"card_uid\":\"" + uid + "\",\"sync_type\":\"offline_batch\"}";
      int httpCode = http.POST(payload);

      if (httpCode != 200 && httpCode != 201) {
        // Gagal kirim, simpan kembali
        unsyncedContent += uid + "\n";
      }
      http.end();
    }
  }
  file.close();

  // Tulis ulang sisa log yang belum terkirim
  if (unsyncedContent.length() > 0) {
    File rewriteFile = LittleFS.open("/offline_logs.txt", FILE_WRITE);
    rewriteFile.print(unsyncedContent);
    rewriteFile.close();
  } else {
    LittleFS.remove("/offline_logs.txt");
    Serial.println("Semua log offline berhasil disinkronkan ke server!");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  SPI.begin();
  rfc.PCD_Init();

  if (!LittleFS.begin(true)) {
    Serial.println("Gagal memuat partisi LittleFS!");
  }

  WiFi.begin(ssid, password);
  Serial.println("Mesin Presensi RFID Siap Digunakan.");
}

void loop() {
  // Jalankan sinkronisasi berkala di sela-sela waktu idle
  static unsigned long lastSyncCheck = 0;
  if (millis() - lastSyncCheck > 30000) { // Cek tiap 30 detik
    lastSyncCheck = millis();
    syncOfflineLogs();
  }

  // Cek apakah ada kartu yang didekatkan
  if (!rfc.PICC_IsNewCardPresent() || !rfc.PICC_ReadCardSerial()) {
    return;
  }

  // Ekstraksi UID Kartu ke format HEX
  String cardUid = "";
  for (byte i = 0; i < rfc.uid.size; i++) {
    cardUid += String(rfc.uid.uidByte[i] < 0x10 ? "0" : "");
    cardUid += String(rfc.uid.uidByte[i], HEX);
  }
  cardUid.toUpperCase();
  Serial.println("Kartu Terdeteksi UID: " + cardUid);
  triggerFeedback();

  // Cek status internet
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverApiUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Key", apiKey);

    String payload = "{\"card_uid\":\"" + cardUid + "\",\"sync_type\":\"realtime\"}";
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode == 200 || httpResponseCode == 201) {
      Serial.println("Berhasil dicatat di server!");
    } else {
      Serial.println("Server error, beralih ke penyimpanan lokal...");
      appendOfflineLog(cardUid);
    }
    http.end();
  } else {
    appendOfflineLog(cardUid);
  }

  rfc.PICC_HaltA();
  rfc.PCD_StopCrypto1();
  delay(1000); // Hindari double tap tidak sengaja
}
```

---

## 4. Integrasi Webhook WhatsApp Gateway

Ketika backend menerima data kehadiran dari ESP32, server secara otomatis mencocokkan UID dengan basis data identitas pengguna. Jika kartu milik seorang santri bernama *"Ahmad Rizqi"*, sistem segera menembakkan webhook ke gateway WhatsApp (seperti `wanotif.web.id`):

```json
{
  "target": "081234567890",
  "message": "Assalamu'alaikum Wr. Wb. Ananda Ahmad Rizqi telah melakukan presensi masuk di Pesantren pada pukul 06:45:12 WIB. Status: Tepat Waktu."
}
```

Pesan instan ini memberikan ketenangan hati (*peace of mind*) yang luar biasa bagi wali santri, sekaligus membangun citra institusi pendidikan yang modern dan profesional.

---

## 5. Kesimpulan

Dengan menambahkan mekanisme *Offline Buffer* berbasis LittleFS pada ESP32, Anda telah memecahkan masalah terbesar implementasi IoT di lapangan: **kerentanan konektivitas jaringan**. Sistem presensi ini menjadi tangguh, tidak pernah kehilangan data tap, dan siap diterapkan pada skala ratusan pengguna harian.
