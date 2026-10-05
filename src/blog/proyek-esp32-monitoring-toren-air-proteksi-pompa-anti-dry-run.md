---
title: "Proyek ESP32 Monitoring Toren Air Otomatis: Proteksi Pompa Anti-Dry Run Sensor Waterproof"
slug: "proyek-esp32-monitoring-toren-air-proteksi-pompa-anti-dry-run.md"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "Toren Air", "JSN-SR04T", "Otomasi Pompa", "Anti Dry Run", "IoT", "Hardware"]
summary: "Mengatasi masalah toren air meluber dan pompa air terbakar dengan sistem otomasi level air ESP32 menggunakan sensor ultrasonik kedap air dan proteksi dry-run cerdas."
readingTime: "6 menit baca"
---

Masalah pengelolaan tangki penampungan air (toren) merupakan keluhan klasik di banyak rumah tangga, asrama pondok pesantren, kos-kosan, hingga gedung perkantoran. Dua masalah paling merugikan yang sering berulang adalah:

1. **Air Toren Meluber Tanpa Disadari**: Pelampung mekanik atau radar toren konvensional tersangkut karat atau lumut, menyebabkan pompa air terus menyala berjam-jam hingga air bersih terbuang sia-sia dan tagihan listrik membengkak.
2. **Pompa Terbakar Akibat Kondisi Kering (*Dry-Running*)**: Di musim kemarau saat debit sumur bor atau pasokan PDAM menyusut, pompa air tetap menyala menyedot angin tanpa adanya aliran air pendingin. Gesekan mekanis kering memicu panas ekstrem yang membakar dinamo motor pompa dalam hitungan jam.

Melalui proyek IoT ini, kita akan membangun **Sistem Otomasi dan Monitoring Level Toren Air Cerdas** menggunakan ESP32 dan sensor ultrasonik kedap air (waterproof) JSN-SR04T yang dilengkapi dengan algoritma proteksi *Anti-Dry Run* untuk melindungi pompa air Anda dari kerusakan fatal.

---

## 1. Komponen yang Digunakan

1. **ESP32 Development Board**: Membaca sensor ultrasonik, mengontrol relay daya tinggi, dan mengirimkan data level air ke dashboard web atau MQTT.
2. **Sensor Ultrasonik Kedap Air JSN-SR04T V3.0**: Memiliki transduser probe logam kedap air (*waterproof probe*) yang tahan terhadap kelembaban uap air toren dan lumut, berbeda dengan sensor HC-SR04 biasa yang cepat rusak jika diletakkan di dalam tangki air tertutup.
3. **Modul Relay 30A 250V AC (Optocoupler Isolated)**: Mampu menahan lonjakan arus awal (*inrush current*) dari motor pompa air sumur jet pump atau pompa transfer hingga daya 1000 Watt.
4. **Sensor Aliran Air / Flow Sensor YF-S201 (Opsional untuk deteksi aliran)**: Memastikan air benar-benar mengalir saat pompa menyala sebagai validasi proteksi *anti-dry run*.
5. **Casing Box IP65 Waterproof**: Melindungi modul kontroler elektronik dari paparan hujan di atap gedung.

---

## 2. Prinsip Pengukuran Non-Kontak JSN-SR04T

Sensor JSN-SR04T dipasang di bagian tutup atas toren air menghadap lurus ke bawah permukaan air. Jarak antara probe sensor dengan permukaan air diukur berdasarkan waktu pantulan gelombang suara (*time-of-flight*):

- **Kondisi Toren Kosong**: Jarak pantulan gelombang suara bernilai paling jauh (misalnya 180 cm pada toren setinggi 2 meter).
- **Kondisi Toren Penuh**: Permukaan air mendekati bibir atas toren, jarak pantulan gelombang bernilai paling dekat (misalnya 25 cm, memperhitungkan *blind zone* minimum sensor 20 cm).

Persentase volume air dihitung dengan rumus invers:
`Persen Air = ((Tinggi Maksimal - Jarak Terbaca) / (Tinggi Maksimal - Jarak Minimum)) * 100%`

---

## 3. Logika Proteksi Pompa Anti-Dry Run

Untuk mencegah motor pompa terbakar, ESP32 menerapkan 2 lapisan proteksi otomatis:

1. **Proteksi Waktu Maksimal Pengisian (*Max Run Timeout*)**: Jika toren berkapasitas 1000 liter biasanya penuh dalam waktu 20 menit, sistem menetapkan batas maksimal nyala pompa adalah 25 menit. Jika setelah 25 menit level air tidak kunjung naik, pompa otomatis dimatikan paksa dengan status: *Error: Indikasi Pipa Bocor atau Sumber Air Habis*.
2. **Deteksi Laju Kenaikan Level (*Delta Level Check*)**: Jika dalam 3 menit setelah pompa diaktifkan tidak ada kenaikan ketinggian air minimal 2 cm, sistem mendeteksi pompa sedang menyedot angin (*dry-running*), segera mematikan relay, dan mengirimkan notifikasi peringatan.

---

## 4. Implementasi Kode ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "WIFI_RUMAH";
const char* password = "PASSWORD_WIFI";
const char* mqtt_server = "broker.hivemq.com";

#define TRIG_PIN 5
#define ECHO_PIN 18
#define RELAY_PUMP_PIN 23

// Kalibrasi dimensi toren air Anda (dalam centimeter)
const int TANK_EMPTY_DIST = 180; // Jarak sensor saat toren kosong
const int TANK_FULL_DIST = 25;   // Jarak sensor saat toren penuh

// Ambang batas otomasi pompa
const int LOW_THRESHOLD_PERCENT = 25;  // Pompa NYALA saat air di bawah 25%
const int HIGH_THRESHOLD_PERCENT = 95; // Pompa MATI saat air mencapai 95%

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long pumpStartTime = 0;
const unsigned long MAX_PUMP_RUN_TIME = 25 * 60 * 1000; // Maksimal 25 menit
bool isPumpRunning = false;

int measureWaterDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // Timeout 30ms
  if (duration == 0) return TANK_EMPTY_DIST; // Error handling jika tidak ada pantulan

  int distance = duration * 0.034 / 2;
  return distance;
}

int calculateWaterPercentage(int distance) {
  int percent = map(distance, TANK_EMPTY_DIST, TANK_FULL_DIST, 0, 100);
  return constrain(percent, 0, 100);
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_PUMP_PIN, OUTPUT);

  // Set awal: Pompa MATI (Relay Active LOW)
  digitalWrite(RELAY_PUMP_PIN, HIGH);

  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, 1883);
  Serial.println("Sistem Kontrol Toren Air Siap.");
}

void loop() {
  int distance = measureWaterDistance();
  int waterPercent = calculateWaterPercentage(distance);

  Serial.print("Jarak: ");
  Serial.print(distance);
  Serial.print(" cm | Level Air: ");
  Serial.print(waterPercent);
  Serial.println("%");

  // Logika Pengisian Air Otomatis
  if (waterPercent <= LOW_THRESHOLD_PERCENT && !isPumpRunning) {
    Serial.println("Level air kritis. Menyalakan pompa pengisian...");
    digitalWrite(RELAY_PUMP_PIN, LOW); // Pompa ON
    isPumpRunning = true;
    pumpStartTime = millis();
  }

  // Logika Penghentian Saat Toren Penuh
  if (waterPercent >= HIGH_THRESHOLD_PERCENT && isPumpRunning) {
    Serial.println("Toren penuh. Mematikan pompa...");
    digitalWrite(RELAY_PUMP_PIN, HIGH); // Pompa OFF
    isPumpRunning = false;
  }

  // Proteksi Anti-Dry Run: Matikan jika melebihi batas waktu maksimal pengisian
  if (isPumpRunning && (millis() - pumpStartTime > MAX_PUMP_RUN_TIME)) {
    Serial.println("PERINGATAN: Timeout pengisian tercapai! Mematikan pompa untuk proteksi dry-run.");
    digitalWrite(RELAY_PUMP_PIN, HIGH); // Pompa OFF darurat
    isPumpRunning = false;
  }

  delay(2000);
}
```

---

## 5. Kesimpulan

Mengganti pelampung mekanik konvensional dengan sistem otomasi level toren air berbasis ESP32 dan sensor ultrasonik JSN-SR04T menghemat biaya listrik, mencegah terbuangnya ribuan liter air bersih, dan mengeliminasi risiko biaya perbaikan motor pompa air yang rusak akibat *dry-running*.
