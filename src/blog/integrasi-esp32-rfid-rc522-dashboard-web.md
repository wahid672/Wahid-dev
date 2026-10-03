---
title: "Tutorial Integrasi Mikrokontroler ESP32 dan RFID RC522 ke Web Dashboard"
slug: "integrasi-esp32-rfid-rc522-dashboard-web"
date: "2026-09-20"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "RFID", "IoT", "Embedded System", "C++", "Hardware"]
summary: "Langkah terperinci merakit dan menghubungkan modul pembaca RFID RC522 ke ESP32, memprogram koneksi Wi-Fi dan HTTP POST, serta mengirim data tap kartu ke server backend."
readingTime: "6 menit baca"
---

# Tutorial Integrasi Mikrokontroler ESP32 dan RFID RC522 ke Web Dashboard

Pemanfaatan sistem presensi nirkontak berbasis RFID (Radio Frequency Identification) banyak diaplikasikan di sekolah, pesantren, dan kantor modern. Menggunakan mikrokontroler **ESP32**, data identifikasi kartu dapat langsung dikirimkan melalui jaringan Wi-Fi ke server web tanpa memerlukan komputer perantara.

Dalam artikel ini, kita akan merangkai modul **MFRC522** ke pin ESP32 dan menulis firmware C++ (Arduino Framework) untuk membaca nomor UID kartu serta mengirimkannya ke REST API backend.

---

## 1. Skema Pengkabelan Pin SPI (Pinout ESP32 ke RC522)

Modul RFID RC522 berkomunikasi dengan ESP32 menggunakan protokol SPI (Serial Peripheral Interface). Sambungkan kabel jumper sesuai tabel berikut:

| Pin RFID RC522 | Pin ESP32 (VSPI) | Keterangan |
|---|---|---|
| 3.3V | 3V3 | Catu daya modul (Jangan gunakan 5V) |
| RST | GPIO 22 | Reset Pin |
| GND | GND | Ground |
| MISO | GPIO 19 | Master In Slave Out |
| MOSI | GPIO 23 | Master Out Slave In |
| SCK | GPIO 18 | Serial Clock |
| SDA (SS) | GPIO 21 | Slave Select / Chip Select |

---

## 2. Struktur Firmware C++ ESP32

Pastikan Anda telah menginstal pustaka **MFRC522** dan **WiFiClientSecure** pada Arduino IDE atau PlatformIO.

Berikut adalah kode firmware lengkap untuk membaca kartu dan mengirimkan data JSON:

```cpp
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Konfigurasi Pin RFID
#define SS_PIN  21
#define RST_PIN 22

// Kredensial Wi-Fi Jaringan
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI";

// URL Endpoint Backend Server
const char* serverApiUrl = "https://api.presensirfid.web.id/v1/attendance/tap";

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();

  Serial.println("Menghubungkan ke Wi-Fi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi Terhubung!");
  Serial.print("Alamat IP ESP32: ");
  Serial.println(WiFi.localIP());
  Serial.println("Tempelkan kartu RFID Anda pada reader...");
}

void loop() {
  // Cek apakah ada kartu baru yang mendekati sensor
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // Baca nomor serial kartu
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // Konversi Byte UID menjadi string HEX
  String cardUid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    cardUid += (rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    cardUid += String(rfid.uid.uidByte[i], HEX);
  }
  cardUid.toUpperCase();

  Serial.print("Kartu Terdeteksi UID: ");
  Serial.println(cardUid);

  // Kirim data ke REST API Web
  kirimDataAbsensi(cardUid);

  // Hentikan enkripsi dan pembacaan kartu saat ini
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  // Berikan jeda 2 detik agar tidak terbaca ganda
  delay(2000);
}

void kirimDataAbsensi(String uid) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverApiUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Token", "SECRET_DEVICE_KEY_2026");

    String jsonPayload = "{\"device_id\":\"ESP32-READER-01\",\"card_uid\":\"" + uid + "\"}";
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Respons Server: [");
      Serial.print(httpResponseCode);
      Serial.print("] ");
      Serial.println(response);
    } else {
      Serial.print("Gagal mengirim data. Kode error: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Koneksi Wi-Fi terputus!");
  }
}
```

---

## 3. Penanganan Respons dan Feedback Pengguna

Pada implementasi perangkat fisik, tambahkan buzzer piezoelektrik dan LED indikator dua warna:
- **Buzzer 1x Beep Pendek & LED Hijau**: Menandakan transaksi tap kartu berhasil divalidasi oleh server.
- **Buzzer 2x Beep Panjang & LED Merah**: Menandakan kartu belum terdaftar dalam sistem database santri atau karyawan.

---

## Kesimpulan

Dengan arsitektur langsung ke cloud melalui ESP32, sistem absensi menjadi mandiri, hemat daya, dan dapat ditempatkan di berbagai lokasi gerbang masuk tanpa perlu kabel jaringan lokal yang rumit.
