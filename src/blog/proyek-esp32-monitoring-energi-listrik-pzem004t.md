---
title: "Proyek ESP32 Smart Energy Monitor PZEM-004T: Pantau Tagihan Listrik dan Deteksi Arus Bocor"
slug: "proyek-esp32-monitoring-energi-listrik-pzem004t"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "PZEM-004T", "Energy Monitor", "Smart Home", "IoT", "MQTT", "Hardware"]
summary: "Panduan membangun sistem pemantau daya listrik real-time berbasis ESP32 dan modul PZEM-004T. Mengukur tegangan, arus, daya, hingga kalkulasi estimasi tagihan PLN via MQTT."
readingTime: "7 menit baca"
---

Lonjakan tagihan listrik bulanan yang tidak terduga sering kali menjadi misteri bagi pemilik rumah, pengelola kos-kosan, hingga pelaku usaha bengkel dan UMKM. Tanpa alat ukur yang transparan pada setiap jalur sirkuit, kita sulit mengetahui peralatan elektronik mana yang memboroskan energi atau apakah terdapat indikasi arus bocor yang berpotensi memicu bahaya kebakaran.

Mikrokontroler ESP32 bersama modul sensor daya PZEM-004T V3.0 hadir sebagai solusi otomasi industri berbiaya terjangkau. Proyek ini memungkinkan Anda membaca enam parameter kelistrikan AC secara simultan dengan tingkat akurasi tinggi dan mengirimkan datanya ke dashboard cloud via protokol MQTT.

Berikut adalah panduan arsitektur, skema rangkaian, dan kode program untuk membangun smart energy monitor mandiri berbasis ESP32.

---

## 1. Komponen yang Dibutuhkan (Bill of Materials)

Untuk membangun sistem ini secara aman, siapkan komponen berikut:

1. **ESP32 Development Board (ESP32-WROOM-32)**: Otak pemroses data dengan konektivitas Wi-Fi terintegrasi.
2. **Modul Sensor PZEM-004T V3.0 + Current Transformer (CT) Coil**: Sensor pengukur tegangan AC 80-260V dan arus hingga 100A tipe *split-core* yang aman dipasang tanpa memutus kabel utama.
3. **Power Supply 5V 1A / Adaptor Step-Down Hi-Link HLK-PM01**: Sumber daya DC mandiri untuk menyalakan ESP32 dari tegangan jala-jala listrik.
4. **Resistor 1k Ohm (Opsional untuk proteksi serial UART)**.
5. **Box Panel Enclosure DIN Rail**: Wadah berstandar industri agar rangkaian terpasang rapi dan aman di dalam boks MCB rumah.

---

## 2. Skema Pengkabelan dan Protokol Komunikasi

Sensor PZEM-004T berkomunikasi dengan ESP32 menggunakan protokol komunikasi serial UART (Modbus-RTU) pada baud rate 9600 bps. 

Pinout penyambungan:
- **Pin VCC PZEM-004T** disambungkan ke **Pin 5V ESP32**.
- **Pin GND PZEM-004T** disambungkan ke **Pin GND ESP32**.
- **Pin TX PZEM-004T** disambungkan ke **Pin RX2 (GPIO 16) ESP32**.
- **Pin RX PZEM-004T** disambungkan ke **Pin TX2 (GPIO 17) ESP32**.
- **Sisi AC Voltage Input**: Sambungkan kabel fasa (L) dan netral (N) dari jala-jala PLN ke terminal input tegangan sensor.
- **Current Transformer (CT)**: Kalungkan kumparan CT pada kabel fasa (L) utama yang menuju beban listrik. Pastikan kabel netral tidak ikut masuk ke dalam lingkaran CT agar pembacaan medan elektromagnetik akurat.

> **Peringatan Keselamatan:** Pemasangan pada terminal AC 220V harus dilakukan dengan mematikan MCB utama terlebih dahulu. Gunakan obeng berinsulasi dan sarung tangan pelindung.

---

## 3. Implementasi Kode Program (Arduino IDE / PlatformIO)

Pastikan Anda telah menginstal pustaka `PZEM004Tv30` dan `PubSubClient` pada Arduino IDE atau PlatformIO Anda:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>

// Konfigurasi Wi-Fi dan MQTT Broker
const char* ssid = "WIFI_RUMAH_ANDA";
const char* password = "PASSWORD_WIFI";
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// Deklarasi Hardware Serial 2 ESP32 (RX: 16, TX: 17)
PZEM004Tv30 pzem(Serial2, 16, 17);

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastReadTime = 0;
const unsigned long readInterval = 5000; // Baca setiap 5 detik

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Terkoneksi!");
  client.setServer(mqtt_server, mqtt_port);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32_EnergyMonitor_01")) {
      Serial.println("MQTT Terhubung!");
    } else {
      delay(2000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  if (millis() - lastReadTime >= readInterval) {
    lastReadTime = millis();

    float voltage = pzem.voltage();
    float current = pzem.current();
    float power = pzem.power();
    float energy = pzem.energy();
    float frequency = pzem.frequency();
    float pf = pzem.pf();

    // Validasi pembacaan sensor
    if (isnan(voltage)) {
      Serial.println("Gagal membaca data dari sensor PZEM!");
      return;
    }

    // Format data ke bentuk JSON string
    char payload[256];
    snprintf(payload, sizeof(payload), 
      "{\"voltage\":%.1f,\"current\":%.2f,\"power\":%.1f,\"energy\":%.3f,\"freq\":%.1f,\"pf\":%.2f}",
      voltage, current, power, energy, frequency, pf
    );

    // Publikasikan data ke MQTT Broker
    client.publish("home/iot/energy/metrics", payload);
    Serial.println(payload);

    // Logika Proteksi: Peringatan kelebihan beban
    if (power > 2200.0) { // Jika daya melebihi 2200 Watt
      client.publish("home/iot/energy/alert", "OVERLOAD: Konsumsi daya melebihi batas aman!");
    }
  }
}
```

---

## 4. Integrasi Dashboard dan Kalkulasi Estimasi Rupiah

Data JSON yang dipublikasikan ke topik MQTT dapat dengan mudah divisualisasikan menggunakan:

1. **Node-RED & Home Assistant**:
   Membuat otomasi otomatis yang mematikan relay pemanas air atau AC saat konsumsi total rumah mendekati batas daya langganan meteran PLN (misalnya 2200 VA) agar MCB tidak jeglek.
2. **Kalkulasi Biaya Riil**:
   Dengan mengalikan nilai energi kumulatif (`energy` dalam satuan kWh) dengan tarif dasar listrik (misalnya tarif nonsubsidi R-1/1300 VA sekitar Rp1.444 per kWh), dashboard Anda dapat menampilkan estimasi pengeluaran listrik berjalan setiap hari secara presisi.
3. **Notifikasi Telegram**:
   Meneruskan payload alert ke bot Telegram pribadi jika arus listrik terdeteksi mengalir di atas jam 01.00 dini hari saat seluruh penghuni rumah tidur, yang menandakan kemungkinan terjadinya arus pendek atau lupa mematikan peralatan listrik berat.

---

## 5. Kesimpulan

Membangun smart energy monitor dengan ESP32 dan PZEM-004T bukan sekadar proyek hobi elektronika, melainkan solusi nyata mitigasi bahaya kebakaran kelistrikan dan optimasi penghematan pengeluaran rumah tangga. Dengan biaya komponen di bawah Rp250.000, Anda memperoleh sistem pemantau energi mandiri setara alat meteran digital industri.
