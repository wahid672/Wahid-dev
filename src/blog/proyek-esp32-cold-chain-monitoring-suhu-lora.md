---
title: "Proyek Smart Cold Chain ESP32: Monitoring Suhu Vaksin dan Makanan Beku Jarak Jauh Berbasis LoRa"
slug: "proyek-esp32-cold-chain-monitoring-suhu-lora"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "LoRa SX1278", "Cold Chain", "DS18B20", "IoT Medis", "Logistik Beku", "Hardware"]
summary: "Mencegah kerusakan vaksin medis dan bahan pangan beku pada rantai pasok logistik menggunakan sistem pemantau suhu presisi tinggi berbasis ESP32 dan radio LoRa jarak jauh."
readingTime: "7 menit baca"
---

Dalam industri farmasi, rumah sakit, laboratorium kesehatan, serta distribusi rantai dingin makanan (*cold chain logistics*), menjaga suhu ruangan pendingin (*freezer box*) pada rentang ketat (misalnya -20 derajat Celsius untuk produk beku atau 2 hingga 8 derajat Celsius untuk vaksin medis) adalah syarat mutlak yang diatur oleh standar ketat Badan Pengawas Obat dan Makanan (BPOM) dan WHO.

Kegagalan sistem pendingin pada truk ekspedisi logistik atau pemadaman listrik pada gudang pendingin (*cold storage*) yang tidak disadari petugas dapat merusak ribuan dosis vaksin berharga miliaran rupiah dalam hitungan beberapa jam saja.

Tantangan terbesarnya adalah: boks pendingin truk yang terbuat dari dinding insulasi baja tebal sering kali memblokir sinyal seluler (*cellular dead zone*), membuat pelacakan GPS/IoT berbasis kartu SIM biasa gagal mengirimkan data saat truk melintasi jalur antar-kota yang minim sinyal.

Solusi industri yang andal untuk memecahkan masalah ini adalah membangun **Sistem Pemantau Rantai Dingin (Smart Cold Chain Monitor)** menggunakan ESP32, sensor digital industri DS18B20 berprobe logam tahan air, modul radio jarak jauh **LoRa (Long Range) SX1278**, serta media pencatat data lokal (*blackbox MicroSD logger*).

---

## 1. Komponen Utama Perangkat Keras

1. **ESP32 Development Board (atau ESP32 TTGO LoRa32 V2.1)**: Papan mikrokontroler yang telah mengintegrasikan modul radio LoRa SX1278 frekuensi 433 MHz / 915 MHz dan layar OLED 0.96 inci dalam satu sasis kompak.
2. **Sensor Suhu Digital Tahan Air DS18B20 (Waterproof Stainless Steel Probe)**: Mampu mengukur rentang suhu ekstrem dari **-55 derajat hingga +125 derajat Celsius** dengan akurasi tinggi +/- 0.5 derajat Celsius. Sensor ini berkomunikasi menggunakan protokol 1-Wire yang kebal terhadap derau induksi elektromagnetik kabel panjang.
3. **Modul MicroSD Card Reader SPI**: Bertindak sebagai *blackbox data logger*, menyimpan riwayat suhu setiap menit ke berkas CSV di dalam memori fisik sebagai bukti audit kepatuhan regulasi BPOM.
4. **Baterai Li-Ion 18650 3.7V + BMS Proteksi**: Menyediakan daya cadangan (*uninterruptible power supply*) hingga 48 jam jika mesin truk atau listrik gudang padam total.

---

## 2. Mengapa LoRa Sangat Unggul untuk Cold Chain?

LoRa (Long Range) memanfaatkan modulasi frekuensi *Chirp Spread Spectrum (CSS)* yang memiliki keunggulan telak dibandingkan Wi-Fi atau GSM biasa:

- **Penetrasi Dinding Tebal**: Gelombang radio sub-GHz LoRa (433/915 MHz) sanggup menembus dinding insulasi logam kontainer berpendingin yang biasanya memblokir sinyal GSM seluler.
- **Jangkauan Transmisi Jarak Jauh**: Node pemantau di dalam boks kargo dapat mengirimkan telemetri langsung ke dashboard dasbor sopir truk di bagian kabin depan, atau dari gudang dermaga pelabuhan ke pos kontrol sejauh 3 hingga 5 kilometer.
- **Bebas Pulsa dan Kuota Bulanan**: Komunikasi LoRa menggunakan frekuensi pita bebas izin (*unlicensed ISM band*), sehingga tidak memerlukan biaya kartu SIM untuk setiap titik sensor.

---

## 3. Implementasi Kode ESP32 Transceiver LoRa

Pastikan Anda memasang pustaka `LoRa` oleh Sandeep Mistry dan `OneWire` serta `DallasTemperature` di Arduino IDE:

### Kode Node Pemancar di Dalam Kotak Pendingin (Transmitter):

```cpp
#include <SPI.h>
#include <LoRa.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4
#define LORA_SS 5
#define LORA_RST 14
#define LORA_DIO0 2

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Ambang batas suhu kritis vaksin medis (Standar 2 C hingga 8 C)
const float TEMP_MIN_SAFE = 2.0;
const float TEMP_MAX_SAFE = 8.0;

int packetCounter = 0;

void setup() {
  Serial.begin(115200);
  sensors.begin();

  // Inisialisasi modul LoRa SX1278
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(915E6)) { // Frekuensi 915 MHz (Sesuaikan regulasi frekuensi lokal)
    Serial.println("Gagal inisialisasi modul LoRa!");
    while (1);
  }
  
  LoRa.setTxPower(20); // Daya pancar maksimal 20 dBm untuk menembus dinding pendingin
  Serial.println("Node Pemantau Suhu Vaksin LoRa Aktif.");
}

void loop() {
  sensors.requestTemperatures();
  float currentTemp = sensors.getTempCByIndex(0);

  // Validasi pembacaan sensor
  if (currentTemp == DEVICE_DISCONNECTED_C) {
    Serial.println("Error: Sensor DS18B20 terputus!");
    delay(2000);
    return;
  }

  bool isTemperatureBreached = (currentTemp < TEMP_MIN_SAFE || currentTemp > TEMP_MAX_SAFE);

  Serial.print("Suhu Pendingin: ");
  Serial.print(currentTemp);
  Serial.println(" C");

  // Kirim paket telemetri via gelombang radio LoRa
  LoRa.beginPacket();
  LoRa.print("TRUCK_01;");
  LoRa.print(packetCounter++);
  LoRa.print(";");
  LoRa.print(currentTemp, 2);
  LoRa.print(";");
  LoRa.print(isTemperatureBreached ? "BREACH_CRITICAL" : "NORMAL");
  LoRa.endPacket();

  if (isTemperatureBreached) {
    Serial.println("PERINGATAN: Suhu di luar ambang batas aman! Paket darurat dikirim.");
    delay(5000); // Kirim lebih sering saat darurat (setiap 5 detik)
  } else {
    delay(30000); // Kirim berkala setiap 30 detik saat kondisi normal
  }
}
```

### Kode Node Penerima di Kabin Sopir / Ruang Kontrol (Receiver):

```cpp
#include <SPI.h>
#include <LoRa.h>

#define LORA_SS 5
#define LORA_RST 14
#define LORA_DIO0 2
#define BUZZER_ALARM_PIN 25

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_ALARM_PIN, OUTPUT);
  digitalWrite(BUZZER_ALARM_PIN, LOW);

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(915E6)) {
    Serial.println("Gagal inisialisasi Receiver LoRa!");
    while (1);
  }
  Serial.println("Receiver Kabin Sopir Siap Menerima Data Telemetri Suhu.");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String incomingPayload = "";
    while (LoRa.available()) {
      incomingPayload += (char)LoRa.read();
    }

    int rssi = LoRa.packetRssi(); // Kekuatan sinyal radio
    Serial.print("Data Diterima: " + incomingPayload);
    Serial.print(" | RSSI: ");
    Serial.println(rssi);

    // Evaluasi jika terjadi pelanggaran suhu
    if (incomingPayload.indexOf("BREACH_CRITICAL") != -1) {
      Serial.println("PERINGATAN AUDIOPLAN: Suhu boks pendingin rusak! Bunyikan alarm kabin.");
      digitalWrite(BUZZER_ALARM_PIN, HIGH);
    } else {
      digitalWrite(BUZZER_ALARM_PIN, LOW);
    }
  }
}
```

---

## 4. Keuntungan Nyata untuk Industri Logistik dan Kesehatan

1. **Pencegahan Kerugian Finansial**: Sopir atau pengelola logistik langsung diberi tahu saat suhu boks pendingin naik ke 9 derajat Celsius, sehingga dapat segera memeriksa sirkuit kompresor pendingin sebelum seluruh stok vaksin atau bahan pangan rusak.
2. **Kepatuhan Audit Regulasi**: Berkas log suhu per menit yang tersimpan di kartu MicroSD menjadi dokumen resmi validasi bahwa seluruh proses distribusi bahan medis telah mematuhi pedoman *Cara Distribusi Obat yang Baik (CDOB)* BPOM.
3. **Ketahanan Lingkungan Ekstrem**: Sensor dengan selubung baja tahan karat tahan terhadap pembentukan bunga es (*frost*), kelembaban kondensasi tinggi, serta zat pembersih kimia disinfektan ruang medis.
