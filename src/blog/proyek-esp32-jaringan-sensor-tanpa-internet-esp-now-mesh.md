---
title: "Proyek Jaringan Sensor ESP32 Tanpa Internet: Topologi ESP-NOW Mesh untuk Area Perkebunan dan Tambang"
slug: "proyek-esp32-jaringan-sensor-tanpa-internet-esp-now-mesh"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "ESP-NOW", "Mesh Network", "Tanpa Internet", "Pertanian Cerdas", "Long Range", "Hardware"]
summary: "Membangun jaringan pemantauan sensor multi-titik di area terpencil tanpa sinyal internet atau router Wi-Fi menggunakan protokol peer-to-peer ESP-NOW berdaya rendah."
readingTime: "6 menit baca"
---

Penerapan sistem Internet of Things (IoT) di area perkebunan sawit, tambak udang pesisir, perhutanan, maupun area pertambangan terpencil sering kali terbentur oleh satu kendala besar: **ketiadaan sinyal internet seluler dan ketidakmungkinan memasang router Wi-Fi konvensional** di setiap sudut lahan yang membentang seluas puluhan hektar.

Router Wi-Fi komersial umumnya hanya memiliki jangkauan 20-30 meter dan membutuhkan infrastruktur kabel listrik AC yang rumit. Selain itu, proses *handshake* koneksi Wi-Fi standar (DHCP, WPA2) memakan waktu 2 hingga 4 detik dan menguras daya baterai secara masif.

Espressif Systems menghadirkan solusi revolusioner bawaan chip ESP32 bernama **ESP-NOW**. Protokol komunikasi nirkabel berbasis paket data 2.4 GHz ini bekerja secara *peer-to-peer* langsung antar perangkat tanpa memerlukan perantara router Wi-Fi dan tanpa membutuhkan koneksi internet.

Artikel ini memandu Anda merancang jaringan sensor lingkungan nirkabel jarak jauh (*wireless sensor network*) menggunakan ESP-NOW dengan arsitektur multi-node ke satu gateway penerima.

---

## 1. Keunggulan Protokol ESP-NOW Dibandingkan Wi-Fi Standar

| Parameter Komparasi | Wi-Fi Konvensional | ESP-NOW Protokol |
| :--- | :--- | :--- |
| **Ketergantungan Router** | Wajib ada router / access point | Bekerja langsung antar ESP32 (*peer-to-peer*) |
| **Koneksi Internet** | Dibutuhkan untuk cloud sinkronisasi | Tidak butuh internet sama sekali |
| **Waktu Transmisi Data** | 2000 - 4000 milidetik (Handshake) | Cepat (Di bawah 5 milidetik) |
| **Jangkauan Ruang Terbuka** | 30 - 50 meter | Hingga 200 - 400 meter (Line-of-Sight) |
| **Konsumsi Daya Baterai** | Tinggi (sulit bertahan dengan baterai kecil) | Sangat Rendah (Cocok untuk Deep Sleep) |
| **Kapasitas Payload** | Tidak terbatas | Maksimal 250 byte per paket data |

---

## 2. Arsitektur Jaringan: Multi-Node Sensor ke Central Gateway

Sistem dirancang dengan arsitektur bintang (*star topology*) atau jala (*mesh topology*):

1. **Node Sensor (Transmitter / Pengirim)**:
   - Tersebar di titik-titik lahan perkebunan.
   - Dilengkapi sensor kelembaban tanah, sensor suhu udara, dan baterai Li-Ion 18650 yang diisi ulang oleh panel surya kecil 5V 1W.
   - Berada dalam mode tidur pulas (*Deep Sleep*) selama 10 menit untuk menghemat baterai. Saat bangun, membaca sensor, mengirim paket ESP-NOW selama 3 milidetik, lalu langsung tidur kembali.
2. **Node Gateway (Receiver / Penerima)**:
   - Diletakkan di pos keamanan, kantor kebun, atau titik yang memiliki catu daya stabil.
   - Menerima paket data dari seluruh node sensor berdasarkan alamat fisik MAC Address.
   - Menyimpan seluruh riwayat log data ke kartu MicroSD lokal atau meneruskannya ke dashboard jika terdapat koneksi GSM/Satelit.

---

## 3. Implementasi Kode ESP-NOW

### Kode Node Pengirim (Sensor Transmitter):

```cpp
#include <esp_now.h>
#include <WiFi.h>

// MAC Address dari ESP32 Gateway Penerima (Ganti sesuai hasil cek MAC Address penerima Anda)
uint8_t broadcastAddress[] = {0x24, 0x0A, 0xC4, 0xXX, 0xXX, 0xXX};

// Struktur paket data yang dikirim (Maksimal 250 byte)
typedef struct struct_message {
  int nodeId;
  float temperature;
  float humidity;
  int soilMoisture;
  float batteryVoltage;
} struct_message;

struct_message myData;
esp_now_peer_info_t peerInfo;

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA); // Wajib mode Station untuk ESP-NOW

  if (esp_now_init() != ESP_OK) {
    Serial.println("Gagal inisialisasi ESP-NOW!");
    return;
  }

  // Daftarkan Gateway sebagai Peer
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Gagal menambahkan peer penerima!");
    return;
  }

  // Simulasi pembacaan data sensor di kebun
  myData.nodeId = 1;
  myData.temperature = 28.4;
  myData.humidity = 76.2;
  myData.soilMoisture = 65;
  myData.batteryVoltage = 4.12;

  // Kirim paket data via ESP-NOW
  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
  
  if (result == ESP_OK) {
    Serial.println("Data sensor kebun berhasil dikirim dalam 3ms!");
  } else {
    Serial.println("Gagal mengirim data!");
  }

  // Masuk ke mode Deep Sleep selama 10 menit (600 detik) untuk efisiensi baterai
  Serial.println("Memulai Deep Sleep...");
  esp_sleep_enable_timer_wakeup(600ULL * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Kosong karena ESP32 langsung tidur pulas setelah setup selesai
}
```

### Kode Node Penerima (Central Gateway):

```cpp
#include <esp_now.h>
#include <WiFi.h>

typedef struct struct_message {
  int nodeId;
  float temperature;
  float humidity;
  int soilMoisture;
  float batteryVoltage;
} struct_message;

struct_message incomingData;

// Callback fungsi saat ada paket data masuk
void OnDataRecv(const uint8_t * mac, const uint8_t *incomingDataBytes, int len) {
  memcpy(&incomingData, incomingDataBytes, sizeof(incomingData));
  
  Serial.println("====================================");
  Serial.print("Paket Diterima dari Node ID: ");
  Serial.println(incomingData.nodeId);
  Serial.print("Suhu Udara: ");
  Serial.print(incomingData.temperature);
  Serial.println(" C");
  Serial.print("Kelembaban Tanah: ");
  Serial.print(incomingData.soilMoisture);
  Serial.println(" %");
  Serial.print("Tegangan Baterai: ");
  Serial.print(incomingData.batteryVoltage);
  Serial.println(" Volt");
  Serial.println("====================================");
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Gagal inisialisasi ESP-NOW Gateway!");
    return;
  }
  
  // Daftarkan fungsi penerima paket
  esp_now_register_recv_cb(esp_now_recv_cb_t(OnDataRecv));
  Serial.println("ESP32 Central Gateway Siap Menerima Data Sensor Kebun.");
}

void loop() {
  // Gateway standby 24 jam mendengarkan paket masuk
}
```

---

## 4. Tips Peningkatan Jangkauan di Lahan Terbuka

1. **Gunakan Modul ESP32 dengan Antena Eksternal (ESP32-WROOM-32U)**: Mengganti antena bawaan PCB dengan antena omnidirectional 5dBi eksternal mampu melipatgandakan jangkauan transmisi sinyal radio hingga menembus 400 - 500 meter di area pandang terbuka (*line-of-sight*).
2. **Ketinggian Tiang Node**: Pasang tiang sensor minimal 1.5 hingga 2 meter di atas tanah untuk meminimalkan redaman sinyal yang terserap oleh daun tanaman basah dan kontur tanah (*Fresnel zone clearance*).
3. **Masa Pakai Baterai Ekstrem**: Dengan durasi bangun hanya 100 milidetik per siklus pengiriman dan konsumsi arus saat *deep sleep* hanya 10-15 mikroampere, satu baterai Li-Ion 18650 kapasitas 2600 mAh sanggup memberi daya node sensor selama **lebih dari 1.5 tahun tanpa perlu diganti**.
