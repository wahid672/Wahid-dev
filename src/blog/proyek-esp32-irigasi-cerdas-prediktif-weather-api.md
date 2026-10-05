---
title: "Proyek ESP32 Irigasi Cerdas Prediktif: Integrasi Weather API dan Sensor Tanah Kapasitif"
slug: "proyek-esp32-irigasi-cerdas-prediktif-weather-api"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "Smart Agriculture", "Weather API", "Irigasi Otomatis", "IoT", "Relay Pompa", "Hardware"]
summary: "Menghemat air dan mencegah pembusukan akar tanaman dengan sistem irigasi cerdas ESP32 yang memadukan sensor tanah kapasitif dan data ramalan cuaca publik."
readingTime: "6 menit baca"
---

Sistem penyiraman tanaman otomatis berbasis timer mekanik konvensional memiliki kelemahan mendasar: sistem tetap menyemprotkan air secara membabi buta meskipun hujan deras baru saja mengguyur lahan perkebunan. Akibatnya terjadi pemborosan air, pembengkakan tagihan listrik pompa, serta risiko tinggi pembusukan akar tanaman (*root rot*) akibat kelembaban tanah yang berlebihan.

Sebaliknya, sistem yang hanya mengandalkan sensor kelembaban tanah sederhana sering kali menyiram tanaman sesaat sebelum badai hujan tiba, sehingga proses pemupukan menjadi sia-sia karena hanyut terbawa air hujan.

Solusi cerdas untuk memecahkan masalah ini adalah membangun **Sistem Irigasi Prediktif** berbasis ESP32. Sistem ini menggabungkan sensor kelembaban tanah kapasitif anti-karat dengan data ramalan cuaca *real-time* via API publik (OpenWeatherMap). Jika cuaca diprediksi akan hujan dalam 3 jam ke depan, ESP32 secara cerdas menunda jadwal penyiraman.

---

## 1. Komponen dan Keunggulan Sensor Kapasitif

Daftar komponen utama yang dibutuhkan:

1. **ESP32 NodeMCU**: Mengontrol relay dan melakukan panggilan HTTP GET ke Weather API.
2. **Capacitive Soil Moisture Sensor v1.2**: Wajib menggunakan sensor tipe **kapasitif**, bukan sensor resistif bertaring dua. Sensor resistif cepat berkarat (*korosi elektrolisis*) dalam 2-3 minggu pemakaian di dalam tanah basah, sedangkan sensor kapasitif dilapisi pelindung anti-karat yang awet bertahun-tahun.
3. **Modul Relay 5V 1-Channel dengan Optocoupler**: Saklar elektromagnetik aman untuk mengendalikan pompa air 220V atau solenoid valve 12V.
4. **Sensor Suhu dan Kelembaban Udara DHT22**: Mengukur iklim mikro (*microclimate*) di sekitar tajuk tanaman.

---

## 2. Skema Rangkaian Hardware

Koneksi kabel rangkaian:
- **Sensor Kapasitif VCC** ke **3.3V ESP32**
- **Sensor Kapasitif GND** ke **GND ESP32**
- **Sensor Kapasitif AOUT (Analog)** ke **GPIO 34 (ADC1_CH6) ESP32** (Gunakan pin ADC1 karena ADC2 tidak bisa membaca analog saat modul Wi-Fi aktif).
- **Modul Relay VCC** ke **5V VIN**
- **Modul Relay GND** ke **GND**
- **Modul Relay IN** ke **GPIO 26**
- **Sensor DHT22 Data** ke **GPIO 27** dengan pull-up resistor 10k ke 3.3V.

---

## 3. Logika Algoritma Prediktif (Decision Matrix)

ESP32 mengeksekusi logika keputusan penyiraman dengan aturan prioritas:

1. Baca nilai kelembaban tanah kapasitif. Jika kelembaban di atas 60% (tanah masih basah), **JANGAN NYALAKAN POMPA**.
2. Jika kelembaban tanah di bawah ambang batas kering (< 35%), jangan langsung menyiram. Lakukan panggilan API ke OpenWeatherMap untuk koordinat lintang/bujur kebun Anda.
3. Evaluasi parameter cuaca:
   - Jika kondisi cuaca mengindikasikan hujan (*Rain*, *Thunderstorm*, atau probabilitas hujan > 70%), **TUNDA PENYIRAMAN** selama 3 jam ke depan.
   - Jika cuaca cerah (*Clear*, *Sunny*, atau berawan ringan), **AKTIFKAN POMPA AIR** selama durasi presisi (misalnya 45 detik) lalu matikan kembali.

---

## 4. Implementasi Kode Program ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "WIFI_KEBUN";
const char* password = "PASSWORD_WIFI";

// Konfigurasi OpenWeatherMap API
const String apiKey = "MASUKKAN_OPENWEATHERMAP_API_KEY";
const String city = "Malang";
const String countryCode = "ID";

#define SOIL_PIN 34
#define RELAY_PIN 26

// Nilai kalibrasi sensor kapasitif (Ukur di udara kering dan di segelas air)
const int AIR_VALUE = 3200;   // Kondisi 0% kering
const int WATER_VALUE = 1450; // Kondisi 100% basah

unsigned long lastCheckTime = 0;
const unsigned long checkInterval = 15 * 60 * 1000; // Cek tiap 15 menit

bool willItRainSoon() {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "," + countryCode + "&appid=" + apiKey;
  http.begin(url);
  int httpCode = http.GET();

  bool rainPredicted = false;
  if (httpCode == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, payload);

    String weatherMain = doc["weather"][0]["main"].as<String>();
    Serial.println("Prakiraan Cuaca Saat Ini: " + weatherMain);

    if (weatherMain == "Rain" || weatherMain == "Thunderstorm" || weatherMain == "Drizzle") {
      rainPredicted = true;
    }
  }
  http.end();
  return rainPredicted;
}

int readSoilMoisturePercent() {
  int rawAnalog = analogRead(SOIL_PIN);
  int percentage = map(rawAnalog, AIR_VALUE, WATER_VALUE, 0, 100);
  return constrain(percentage, 0, 100);
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Relay aktif LOW, set awal MATI

  WiFi.begin(ssid, password);
  Serial.println("Menghubungkan ke Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nSistem Irigasi Cerdas Aktif!");
}

void loop() {
  if (millis() - lastCheckTime >= checkInterval || lastCheckTime == 0) {
    lastCheckTime = millis();

    int soilMoisture = readSoilMoisturePercent();
    Serial.print("Kelembaban Tanah: ");
    Serial.print(soilMoisture);
    Serial.println("%");

    if (soilMoisture < 35) {
      Serial.println("Tanah kering terdeteksi. Memeriksa prakiraan cuaca...");
      bool rainSoon = willItRainSoon();

      if (!rainSoon) {
        Serial.println("Cuaca cerah. Menyalakan pompa irigasi selama 45 detik...");
        digitalWrite(RELAY_PIN, LOW); // Pompa ON
        delay(45000);                 // Siram selama 45 detik
        digitalWrite(RELAY_PIN, HIGH); // Pompa OFF
        Serial.println("Penyiraman selesai.");
      } else {
        Serial.println("Prakiraan cuaca hujan. Penyiraman otomatis dibatalkan untuk menghemat air.");
      }
    } else {
      Serial.println("Kelembaban tanah masih optimal. Pompa dalam status istirahat.");
    }
  }
}
```

---

## 5. Manfaat Nyata di Lapangan

1. **Efisiensi Air Hingga 40%**: Mengeliminasi penyiraman yang tidak perlu sebelum hujan alami membasahi kebun.
2. **Kesehatan Tanaman Terjaga**: Tanaman cabai, tomat, melon, dan sayuran hidroponik/organik terhindar dari penyakit jamur tanah akibat kondisi media tanam yang terlalu basah (*over-watering*).
3. **Otomasi Penuh Bebas Khawatir**: Pemilik kebun atau greenhouse dapat meninggalkan instalasi selama berhari-hari tanpa cemas tanaman layu kekeringan atau mati busuk.
