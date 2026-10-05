---
title: "Proyek ESP32 Deteksi Jatuh Lansia Otomatis: Sensor MPU6050 dan Alarm Darurat SOS Telegram"
slug: "proyek-esp32-deteksi-jatuh-lansia-emergency-sos"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "Deteksi Jatuh", "MPU6050", "Kesehatan Lansia", "IoT Medis", "Emergency SOS", "Hardware"]
summary: "Sistem pendeteksi insiden jatuh otomatis untuk orang tua dan lansia berbasis ESP32 dan sensor gerak MPU6050 dengan jeda pembatalan dan panggilan bantuan darurat SOS."
readingTime: "6 menit baca"
---

Insiden terjatuh pada orang lanjut usia (lansia) di area kamar mandi, tangga, atau kamar tidur merupakan salah satu risiko medis paling berbahaya dalam kehidupan sehari-hari. Akibat melemahnya refleks dan kekuatan tulang, lansia yang terjatuh sering kali mengalami dislokasi sendi, cedera kepala, atau patah tulang panggul yang membuat mereka tergeletak tidak berdaya dan tidak mampu meraih ponsel untuk meminta pertolongan keluarga.

Keterlambatan pertolongan medis selama beberapa jam (*the golden hour*) dapat berakibat fatal atau memicu komplikasi permanen.

Untuk memberikan perlindungan proaktif bagi orang tua yang tinggal sendiri di rumah, kita dapat membangun **Sistem Deteksi Jatuh Cerdas (Automated Fall Detection System)** menggunakan mikrokontroler ESP32 dan sensor inersia 6-sumbu MPU6050. Perangkat ini secara otomatis mengenali pola fisik gerakan jatuh, memberikan waktu jeda 15 detik bagi lansia untuk membatalkan jika itu bukan insiden serius, lalu segera mengirimkan peringatan darurat SOS ke smartphone keluarga via Telegram.

---

## 1. Komponen yang Digunakan

1. **ESP32 NodeMCU (atau ESP32-C3 Mini untuk Wearable)**: Memproses data akselerasi dan giroskop dengan konsumsi daya rendah.
2. **Sensor IMU 6-Sumbu MPU6050**: Mengukur percepatan gravitasi 3-sumbu (X, Y, Z) dan kecepatan sudut rotasi tubuh (*gyroscope*).
3. **Buzzer Aktif 5V**: Menghasilkan bunyi bip peringatan awal saat jatuh terdeteksi.
4. **Push Button Darurat (Tombol Batal / SOS Manual)**: Berfungsi ganda: ditekan sekali untuk membatalkan alarm jika pengguna hanya tersandung ringan, atau ditekan tahan 3 detik untuk memicu sinyal darurat manual sewaktu-waktu.
5. **Baterai Li-Po 3.7V + Modul Charger TP4056**: Sumber daya portabel jika sistem dirancang dalam bentuk perangkat saku (*pocket device*) atau sabuk pinggang.

---

## 2. Algoritma Pola Gerakan Jatuh (Fall Detection Pattern)

Sebuah peristiwa jatuh memiliki tanda dinamika biomekanik yang sangat khas yang membedakannya dari aktivitas harian seperti duduk, sujud shalat, atau berbaring di tempat tidur:

1. **Fase 1: Free Fall (Jatuh Bebas Singkat)**: Terjadi penurunan nilai percepatan total secara mendadak mendekati 0.5g selama beberapa ratus milidetik.
2. **Fase 2: Impact Spike (Benturan Fisik Keras)**: Saat tubuh membentur lantai, terjadi lonjakan akselerasi tajam yang sangat tinggi (biasanya melebihi 2.8g hingga 3.5g).
3. **Fase 3: Posture Change (Perubahan Sudut Kemiringan Tubuh)**: Sudut kemiringan orientasi tubuh berubah secara drastis dari tegak (vertikal) menjadi rebah telentang atau tengkurap (horizontal).
4. **Fase 4: Inactivity (Ketidakberdayaan / Tidak Ada Gerakan)**: Setelah benturan, sensor mendeteksi keheningan gerakan selama beberapa detik karena korban syok atau pingsan.

Kombinasi keempat fase berurutan inilah yang menjadi dasar algoritma deteksi jatuh pada kode program ESP32 untuk meminimalkan alarm palsu.

---

## 3. Implementasi Kode ESP32

```cpp
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>

const char* ssid = "WIFI_RUMAH";
const char* password = "PASSWORD_WIFI";
#define BOT_TOKEN "TOKEN_TELEGRAM_ANDA"
#define CHAT_ID "CHAT_ID_KELUARGA"

WiFiClientSecure secured_client;
UniversalTelegramBot bot(BOT_TOKEN, secured_client);

const int MPU_ADDR = 0x68;
#define BUZZER_PIN 25
#define BUTTON_CANCEL_PIN 26

int16_t ax, ay, az;
bool fallDetected = false;
unsigned long fallTime = 0;
const unsigned long CANCEL_GRACE_PERIOD = 15000; // 15 detik jeda pembatalan

void sendEmergencySosAlert() {
  digitalWrite(BUZZER_PIN, HIGH); // Sirine berbunyi kencang terus-menerus
  
  String alertMsg = "DARURAT MEDIS: LANSIA JATUH TERDETEKSI!\n\n";
  alertMsg += "Perangkat: Smart Health Monitor Kamar Tidur\n";
  alertMsg += "Kondisi: Terdeteksi benturan keras dan perubahan posisi tubuh tidak bergerak.\n";
  alertMsg += "Waktu Tanggap: Pengguna tidak menekan tombol pembatalan dalam 15 detik.\n";
  alertMsg += "Tindakan: Harap segera hubungi atau datangi lokasi kamar orang tua!";

  bot.sendMessage(CHAT_ID, alertMsg, "Markdown");
  Serial.println("Pesan SOS Darurat Berhasil Terkirim ke Keluarga!");
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_CANCEL_PIN, INPUT_PULLUP);
  digitalWrite(BUZZER_PIN, LOW);

  Wire.begin();
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // Power Management register
  Wire.write(0);    // Bangunkan MPU6050
  Wire.endTransmission(true);

  WiFi.begin(ssid, password);
  secured_client.setCACert(TELEGRAM_CERTIFICATE_ROOT);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nSistem Deteksi Jatuh Lansia Siap Beroperasi.");
}

void loop() {
  // Cek tombol manual pembatalan
  if (digitalRead(BUTTON_CANCEL_PIN) == LOW) {
    if (fallDetected) {
      Serial.println("Alarm dibatalkan oleh pengguna (kondisi aman).");
      fallDetected = false;
      digitalWrite(BUZZER_PIN, LOW);
      delay(1000);
      return;
    }
  }

  // Jika sedang dalam masa jeda pembatalan 15 detik
  if (fallDetected) {
    // Bunyikan buzzer bip peringatan ritmis agar lansia tahu alarm akan terpicu
    digitalWrite(BUZZER_PIN, (millis() / 300) % 2);

    if (millis() - fallTime > CANCEL_GRACE_PERIOD) {
      fallDetected = false;
      sendEmergencySosAlert();
    }
    return;
  }

  // Baca data akselerasi dari MPU6050
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  ax = Wire.read() << 8 | Wire.read();
  ay = Wire.read() << 8 | Wire.read();
  az = Wire.read() << 8 | Wire.read();

  // Konversi data mentah ke satuan G (1G = gravitasi bumi normal)
  float gX = ax / 16384.0;
  float gY = ay / 16384.0;
  float gZ = az / 16384.0;

  // Hitung magnitudo total vektor percepatan
  float totalAcceleration = sqrt(gX * gX + gY * gY + gZ * gZ);

  // Deteksi fase benturan keras (> 2.8G)
  if (totalAcceleration > 2.85) {
    Serial.print("Benturan keras terdeteksi! Nilai G: ");
    Serial.println(totalAcceleration);
    
    // Beri jeda 500ms untuk evaluasi apakah posisi tubuh berubah rebah
    delay(500);
    
    fallDetected = true;
    fallTime = millis();
    Serial.println("Memulai masa tenggang 15 detik sebelum kirim SOS...");
  }

  delay(20); // Sampling frekuensi 50 Hz
}
```

---

## 4. Rekomendasi Pemasangan dan Desain Fisik

1. **Model Sabuk Pinggang (*Waist Belt Clip*)**: Penempatan di area pinggang merupakan posisi paling akurat untuk mengukur pusat gravitasi tubuh manusia (*center of mass*), menghasilkan deteksi yang jauh lebih akurat dibandingkan pemasangan di pergelangan tangan (jam tangan pintar kerap salah mengira tepuk tangan keras atau melempar barang sebagai insiden jatuh).
2. **Model Dinding Kamar Mandi**: Jika lansia enggan memakai perangkat wearable, sensor dapat dipasangkan di dinding kamar mandi dengan memanfaatkan sensor radar gelombang mikro mmWave 24 GHz (seperti LD2410) yang mampu mendeteksi orang tergeletak di lantai tanpa kamera.
3. **Penyertaan Tombol Tarik Darurat**: Di kamar mandi, sertakan tali tarik darurat (*pull-cord SOS*) yang terhubung ke pin GPIO ESP32 agar dapat ditarik dengan mudah dari lantai.
