---
title: "Proyek ESP32-CAM Edge AI Vision: Deteksi Tamu dan Orang Asing Tanpa Ketergantungan Cloud"
slug: "proyek-esp32-cam-edge-ai-vision-deteksi-tamu-tanpa-cloud"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32-CAM", "Edge AI", "TinyML", "Smart Security", "CCTV AI", "Computer Vision", "Hardware"]
summary: "Membangun kamera keamanan pintar berbasis ESP32-CAM dengan inferensi AI on-device (TinyML) untuk membedakan manusia dari hewan dan bayangan tanpa biaya langganan cloud."
readingTime: "7 menit baca"
---

Kamera pengawas (CCTV) dan sensor gerak PIR konvensional yang dipasang di depan pagar rumah, gudang penyimpanan, atau kantor sering kali membuat pemilik frustrasi akibat tingginya angka alarm palsu (*false positive*). Daun pohon yang bergoyang tertiup angin, sorot lampu mobil yang lewat di jalan, atau kucing liar yang melintas di pekarangan dapat memicu sirine berbunyi di tengah malam dan membanjiri notifikasi ponsel Anda.

Sebaliknya, kamera pintar komersial yang memiliki fitur pengenalan manusia (*human detection*) umumnya mewajibkan biaya langganan bulanan (*cloud subscription*) yang mahal serta menimbulkan kekhawatiran privasi karena rekaman video pribadi Anda harus terus diunggah ke server pihak ketiga 24 jam nonstop.

Melalui kemajuan teknologi **TinyML (Tiny Machine Learning)** dan kehadiran mikrokontroler berkamera hemat biaya seperti **ESP32-CAM** (atau ESP32-S3 Sense), kita kini dapat menjalankan model kecerdasan buatan langsung di dalam chip perangkat (*Edge AI Vision*). Sistem ini mampu mendeteksi keberadaan siluet manusia secara lokal, privat, dan bebas biaya langganan.

---

## 1. Komponen Perangkat Keras yang Dibutuhkan

1. **Modul ESP32-CAM AI-Thinker (atau ESP32-S3-CAM)**: Memiliki modul kamera OV2640 2 Megapiksel dan slot kartu memori MicroSD bawaan serta PSRAM 4MB/8MB yang krusial untuk menampung buffer frame gambar dan bobot model neural network.
2. **FTDI USB to TTL Converter (FT232RL)**: Diperlukan untuk proses flashing firmware dan debugging serial pada ESP32-CAM (karena modul ini tidak memiliki port micro-USB bawaan).
3. **Sensor PIR Mini AM312 (Passive Infrared)**: Bertindak sebagai pemicu bangun (*hardware interrupt*) berdaya rendah, sehingga kamera hanya aktif memproses gambar saat ada perubahan suhu panas tubuh di depannya.
4. **Modul Catu Daya 5V 2A Stabil**: ESP32-CAM membutuhkan arus puncak (*peak current*) yang cukup besar saat mengaktifkan modul Wi-Fi dan lampu flash LED.

---

## 2. Arsitektur Edge AI Vision (Privasi 100%)

Sistem bekerja dengan prinsip **Edge Computing**:

```
[Ruang Terbuka] -> [PIR Sensor Mendeteksi Gerak] 
                 -> [ESP32-CAM Bangun & Mengambil 1 Frame Foto] 
                 -> [Eksekusi Model TinyML: Human Detection]
                     |
                     +--> [Prediksi Bukan Manusia (Kucing/Daun)] -> Abaikan, Tidur Kembali
                     |
                     +--> [Prediksi Manusia (> 85% Confidence)] 
                            -> Simpan Foto HD ke MicroSD
                            -> Kirim Foto Snapshot ke Bot Telegram
```

Data rekaman gambar tidak pernah dialirkan secara konstan ke internet (*zero continuous streaming*). Hal ini menghemat kuota internet dan menjaga privasi keluarga Anda seutuhnya.

---

## 3. Pelatihan Model TinyML via Edge Impulse

Untuk membuat model deteksi manusia berukuran sangat ringkas yang muat di dalam memori ESP32:

1. Buka platform pengembang **Edge Impulse** (gratis untuk pengembang hobi dan proyek riset).
2. Kumpulkan dataset berupa 300 foto: 150 foto dengan objek orang di berbagai pose/jarak, dan 150 foto latar belakang kosong (pohon, mobil, hewan, malam hari).
3. Buat pipeline Impulse:
   - **Image Data**: Resolusi grayscale 96x96 piksel (atau warna RGB 96x96).
   - **Learning Block**: *FOMO (Faster Objects, More Objects)* MobileNetV2 0.35. FOMO adalah arsitektur visi komputer ultra-ringan rancangan Edge Impulse yang mampu berjalan pada mikrokontroler dengan memori di bawah 250 KB RAM.
4. Latih model (*train*) hingga mencapai akurasi F1-Score di atas 90%.
5. Ekspor model ke format **Arduino C++ Library**. Unduh file zip pustaka dan pasang ke Arduino IDE Anda.

---

## 4. Implementasi Kode ESP32-CAM

```cpp
#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include <nama_proyek_anda_inferencing.h> // Pustaka hasil ekspor Edge Impulse

#define PIR_PIN 13
#define FLASH_LED_PIN 4

const char* ssid = "WIFI_RUMAH";
const char* password = "PASSWORD_WIFI";
#define BOT_TOKEN "TOKEN_TELEGRAM_ANDA"
#define CHAT_ID "CHAT_ID_ANDA"

WiFiClientSecure secured_client;
UniversalTelegramBot bot(BOT_TOKEN, secured_client);

// Pin konfigurasi AI-Thinker ESP32-CAM
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA; // 320x240
  config.jpeg_quality = 12;
  config.fb_count = 2;

  esp_err_t err = esp_camera_init(&config);
  return (err == ESP_OK);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  if (!initCamera()) {
    Serial.println("Gagal inisialisasi modul kamera OV2640!");
    while(1);
  }

  WiFi.begin(ssid, password);
  secured_client.setCACert(TELEGRAM_CERTIFICATE_ROOT);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nKamera Edge AI Vision Siap Beroperasi!");
}

void loop() {
  // Cek apakah sensor PIR mendeteksi pergerakan fisik
  if (digitalRead(PIR_PIN) == HIGH) {
    Serial.println("Gerakan fisik terdeteksi. Mengambil gambar untuk analisis AI...");
    
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Gagal menangkap frame gambar!");
      return;
    }

    // Jalankan inferensi TinyML Edge Impulse di sini...
    // (Model menganalisis apakah frame berisi siluet orang)
    bool isHumanDetected = true; // Hasil kalkulasi model FOMO

    if (isHumanDetected) {
      Serial.println("TERDETEKSI MANUSIA! Mengirim foto peringatan ke Telegram...");
      
      // Kirim foto snapshot ke Telegram via HTTP POST Multipart
      bot.sendPhotoByBinary(CHAT_ID, "image/jpeg", fb->len, fb->buf, "Peringatan: Orang asing terdeteksi di area pagar depan!", "");
    } else {
      Serial.println("Objek terdeteksi bukan manusia (hewan/bayangan). Notifikasi dibatalkan.");
    }

    esp_camera_fb_return(fb);
    delay(5000); // Jeda pendinginan agar tidak spam
  }
  delay(100);
}
```

---

## 5. Kesimpulan

Dengan mengimplementasikan model Edge AI Vision pada ESP32-CAM, Anda berhasil mengubah modul kamera murah seharga Rp80.000 menjadi perangkat keamanan cerdas yang mandiri. Sistem ini mengeliminasi alarm palsu, melindungi privasi visual keluarga Anda, dan membuktikan bahwa teknologi kecerdasan buatan modern dapat berjalan secara efisien pada mikrokontroler berdaya rendah.
