---
title: "Proyek ESP32 Predictive Maintenance: Analisis Getaran Mesin Industri dengan Sensor Akselerometer dan FFT"
slug: "proyek-esp32-predictive-maintenance-getaran-motor-mesin"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "Predictive Maintenance", "ADXL345", "FFT", "Industri 4.0", "Vibration Analysis", "Hardware"]
summary: "Mencegah downtime mesin pabrik dengan sistem pemeliharaan prediktif berbasis ESP32. Memanfaatkan sensor getaran akselerometer dan algoritma FFT untuk mendeteksi kerusakan bearing mesin."
readingTime: "7 menit baca"
---

Dalam sektor industri manufaktur, pompa pengolahan air limbah, sistem HVAC gedung bertingkat, hingga jalur ban berjalan (*conveyor belt*) pabrik, kerusakan motor listrik secara tiba-tiba (*unplanned downtime*) dapat menelan kerugian operasional hingga puluhan juta rupiah per jam. 

Pendekatan pemeliharaan konvensional biasanya terbagi menjadi dua:
1. **Reactive Maintenance**: Baru memperbaiki mesin setelah berasap atau macet total.
2. **Preventive Maintenance**: Mengganti suku cadang bearing berdasarkan jadwal kalender kaku, yang sering kali membuang komponen yang sebenarnya masih sangat layak pakai.

Pendekatan paling modern dan efisien di era Industri 4.0 adalah **Predictive Maintenance (Pemeliharaan Prediktif)**. Melalui analisis getaran mekanis (*vibration analysis*), setiap gejala awal keausan bantalan peluru (*bearing defect*), ketidakseimbangan poros (*imbalance*), atau ketidaksejajaran kopling (*misalignment*) akan memunculkan tanda frekuensi getaran anomali berminggu-minggu sebelum mesin mengalami kerusakan fisik yang fatal.

Dengan memanfaatkan prosesor ganda (*dual-core*) ESP32 yang memiliki kecepatan clock 240 MHz, kita dapat menjalankan algoritma komputasi **Fast Fourier Transform (FFT)** langsung di perangkat (*edge computing*) untuk menganalisis spektrum getaran motor mesin industri secara mandiri.

---

## 1. Komponen Utama dan Sensor Getaran

Daftar perangkat keras yang dibutuhkan:

1. **ESP32 NodeMCU**: Menjalankan sampling data getaran berkecepatan tinggi pada Core 1 dan mengirimkan hasil analisis via Wi-Fi/MQTT pada Core 0.
2. **Sensor Akselerometer Digital 3-Sumbu ADXL345 (atau MPU6050)**: Sensor dengan rentang pengukuran yang dapat diprogram hingga +/- 16g dan antarmuka komunikasi SPI/I2C berkecepatan tinggi.
3. **Mounting Magnetik / Baut Stud Mekanik**: Sensor akselerometer harus direkatkan secara kaku (*rigid coupling*) ke rumah bearing (*bearing housing*) motor listrik agar getaran frekuensi tinggi dapat merambat sempurna ke sensor.
4. **Modul Step-Down DC-DC Industri**: Mengubah tegangan kontrol panel pabrik (24V DC) menjadi tegangan stabil 5V DC untuk menyalakan ESP32.

---

## 2. Teori Spektrum Getaran dan Algoritma FFT

Getaran mesin yang dibaca oleh sensor akselerometer pada mulanya berbentuk gelombang di domain waktu (*time-domain*). Dalam domain waktu, sangat sulit membedakan apakah getaran tersebut berasal dari putaran poros normal atau akibat retakan mikro pada bola bearing.

Algoritma **Fast Fourier Transform (FFT)** mengubah sinyal domain waktu menjadi **domain frekuensi (frequency-domain)**:

- **Frekuensi Dasar 1X RPM (Rotasi Poros)**: Getaran dominan pada frekuensi putaran mesin (misalnya motor 1500 RPM memiliki frekuensi dasar 25 Hz). Jika amplitudo frekuensi 1X melonjak, itu indikasi kuat terjadinya ketidakseimbangan beban (*mass unbalance*).
- **Frekuensi Harmonis 2X / 3X RPM**: Indikasi terjadinya ketidaksejajaran poros kopling (*shaft misalignment*).
- **Frekuensi Tinggi (1 kHz - 5 kHz)**: Indikasi keausan permukaan lintasan bearing (*bearing race pitting/spalling*).

---

## 3. Implementasi Kode ESP32 dengan Pustaka arduinoFFT

Gunakan pustaka `arduinoFFT` untuk memproses 128 atau 256 sampel getaran secara cepat:

```cpp
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>
#include <arduinoFFT.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define SAMPLES 128             // Jumlah sampel FFT (harus pangkat dua)
#define SAMPLING_FREQUENCY 1000 // Frekuensi sampling 1000 Hz (Maksimal membaca 500 Hz)

Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
ArduinoFFT<double> FFT = ArduinoFFT<double>();

double vReal[SAMPLES];
double vImag[SAMPLES];
unsigned int samplingPeriodUs;

const char* ssid = "WIFI_PABRIK";
const char* password = "PASSWORD_WIFI";
const char* mqtt_server = "192.168.1.100";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  samplingPeriodUs = round(1000000 * (1.0 / SAMPLING_FREQUENCY));

  if (!accel.begin()) {
    Serial.println("Sensor ADXL345 tidak terdeteksi!");
    while (1);
  }
  accel.setRange(ADXL345_RANGE_16_G);

  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, 1883);
  Serial.println("Sistem Predictive Maintenance Aktif.");
}

void loop() {
  unsigned long microseconds;

  // Langkah 1: Pengambilan Sampel Getaran Berkecepatan Tinggi
  for (int i = 0; i < SAMPLES; i++) {
    microseconds = micros();
    sensors_event_t event;
    accel.getEvent(&event);

    // Ambil akselerasi sumur Z (vertikal getaran motor)
    vReal[i] = event.acceleration.z;
    vImag[i] = 0.0; // Bagian imajiner diisi nol

    while (micros() < (microseconds + samplingPeriodUs)) {
      // Tunggu hingga interval sampling terpenuhi
    }
  }

  // Langkah 2: Eksekusi Transformasi FFT
  FFT.windowing(vReal, SAMPLES, FFT_WIN_TYP_HAMMING, FFT_FORWARD);
  FFT.compute(vReal, vImag, SAMPLES, FFT_FORWARD);
  FFT.complexToMagnitude(vReal, vImag, SAMPLES);

  // Langkah 3: Ekstraksi Frekuensi Puncak Dominan
  double peakFrequency = FFT.majorPeak(vReal, SAMPLES, SAMPLING_FREQUENCY);
  
  // Hitung energi rata-rata getaran (RMS Acceleration)
  double sumEnergy = 0;
  for (int i = 2; i < (SAMPLES / 2); i++) { // Abaikan komponen DC di indeks 0 dan 1
    sumEnergy += vReal[i];
  }
  double avgVibrationIntensity = sumEnergy / (SAMPLES / 2);

  Serial.print("Frekuensi Puncak Getaran: ");
  Serial.print(peakFrequency);
  Serial.print(" Hz | Intensitas: ");
  Serial.println(avgVibrationIntensity);

  // Langkah 4: Evaluasi Kondisi Kesehatan Mesin
  if (avgVibrationIntensity > 45.0) {
    Serial.println("PERINGATAN KRITIS: Getaran abnormal terdeteksi! Indikasi keausan bearing.");
    if (client.connect("ESP32_PredictiveMaintenance")) {
      char payload[128];
      snprintf(payload, sizeof(payload), "{\"alert\":\"BEARING_WARNING\",\"peak_hz\":%.1f,\"intensity\":%.2f}", peakFrequency, avgVibrationIntensity);
      client.publish("factory/machine1/vibration/alert", payload);
    }
  }

  delay(3000); // Evaluasi setiap 3 detik
}
```

---

## 4. Visualisasi Dashboard Grafana & InfluxDB

Hasil perhitungan FFT dan RMS akselerasi getaran dapat disimpan ke dalam basis data deret waktu (*time-series database*) InfluxDB dan ditampilkan pada dashboard Grafana:

1. **Grafik Trend Garis**: Memperlihatkan kenaikan getaran secara perlahan dari hari ke hari, memungkinkan tim teknisi menjadwalkan pergantian bearing dua minggu sebelum mesin benar-benar rusak.
2. **Visualisasi Spektrogram**: Menampilkan peta panas (*heatmap*) sebaran frekuensi untuk mendiagnosis apakah masalah getaran bersumber dari resonansi mekanik pondasi atau ausnya gigi transmisi gearbox.

---

## 5. Kesimpulan

Proyek Predictive Maintenance berbasis ESP32 membuktikan bahwa teknologi pemantauan kondisi mesin canggih (*condition monitoring*) tidak lagi menjadi monopoli perangkat industri bernilai puluhan juta rupiah. Solusi edge computing berbiaya terjangkau ini dapat langsung diadopsi oleh pelaku manufaktur skala menengah untuk menekan angka *downtime* produksi secara drastis.
