---
title: "Panduan Lengkap MQTT: Konsep, Implementasi Remote Restart & Reset WiFi ESP32, Serta Instalasi Broker di Docker & VPS Ubuntu"
slug: "panduan-lengkap-mqtt-instalasi-broker-docker-vps-esp32"
date: "2026-10-05"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["MQTT", "Mosquitto", "Docker", "VPS Ubuntu", "ESP32", "IoT", "DevOps"]
summary: "Panduan komprehensif protokol MQTT: jenis QoS, arsitektur topik & LWT, implementasi kontrol jarak jauh ESP32 (restart & reset WiFi), serta instalasi broker Mosquitto via Docker & VPS Ubuntu."
readingTime: "8 menit baca"
---

Dalam ekosistem Internet of Things (IoT) dan sistem embedded, protokol komunikasi data memegang peranan krusial terhadap efisiensi daya baterai, keandalan jaringan, dan latensi transmisi. Protokol HTTP konvensional memiliki beban header (*overhead*) yang terlalu besar serta model *request-response* yang tidak efisien untuk komunikasi dua arah secara *real-time*.

**MQTT (Message Queuing Telemetry Transport)** telah menjadi standar emas de-facto komunikasi M2M (*machine-to-machine*) di dunia IoT. Mengusung arsitektur *publish/subscribe* yang sangat ringan, paket header awal MQTT hanya berukuran 2 byte, menjadikannya ideal untuk mikrokontroler seperti ESP32 yang beroperasi di jaringan seluler atau Wi-Fi dengan bandwidth terbatas.

Panduan mendalam ini membahas tuntas konsep arsitektur MQTT, jenis Kualitas Layanan (QoS), implementasi kontrol jarak jauh ESP32 (perintah *remote restart* dan *reset credential WiFi*), serta tutorial lengkap instalasi broker Eclipse Mosquitto baik menggunakan Docker Compose maupun native di VPS Ubuntu Linux.

---

## 1. Konsep & Arsitektur Utama Protokol MQTT

Komunikasi MQTT tidak menghubungkan pengirim dan penerima secara langsung (*peer-to-peer*), melainkan melalui server perantara yang disebut **Broker**.

```
[Publisher: ESP32 Sensor] ---> Topic: "devices/esp01/temp" ---> [MQTT Broker]
                                                                     |
                                                                     v
[Subscriber: Web Dashboard] <--- Menerima pesan "28.5" <-------------+
```

### Komponen Inti:
1. **MQTT Client**: Setiap perangkat (ESP32, aplikasi mobile, backend server Node.js/Golang) yang terhubung ke broker untuk mempublikasikan (*publish*) atau berlangganan (*subscribe*) data.
2. **MQTT Broker**: Server pusat yang menerima seluruh paket pesan, menyaring topik, dan mendistribusikannya ke seluruh client yang berlangganan topik tersebut.
3. **Topic**: String berjenjang yang dipisahkan oleh tanda garis miring (`/`), misalnya `kantor/lantai2/ruang-server/suhu`.
   - **Wildcard Single-Level (`+`)**: Menggantikan satu tingkat topik, contoh: `kantor/+/ruang-server/suhu`.
   - **Wildcard Multi-Level (`#`)**: Menggantikan seluruh sub-topik di bawahnya, contoh: `kantor/lantai2/#`.

---

## 2. Jenis Kualitas Layanan (Quality of Service / QoS)

MQTT menyediakan tiga level QoS untuk menyesuaikan kebutuhan keandalan pengiriman data:

### QoS 0: At Most Once (Maksimal Satu Kali / Fire and Forget)
- **Cara Kerja**: Pesan dikirim sekali tanpa ada konfirmasi tanda terima (*acknowledgment*) dari broker.
- **Karakteristik**: Latensi paling cepat dan hemat bandwidth, namun ada risiko pesan hilang jika jaringan terputus.
- **Contoh Kasus**: Pembacaan sensor suhu ruangan berkala setiap 5 detik (jika satu data hilang, data berikutnya akan segera tiba).

### QoS 1: At Least Once (Minimal Satu Kali / Terjamin Sampai)
- **Cara Kerja**: Pengirim mengirim pesan dan menunggu konfirmasi `PUBACK` dari broker. Jika dalam batas waktu tertentu tidak ada respon, pengirim akan mengirim ulang paket dengan flag duplikat.
- **Karakteristik**: Pesan dijamin sampai, namun penerima berpotensi menerima pesan ganda jika terjadi gangguan sinyal saat pengiriman tanda terima.
- **Contoh Kasus**: Perintah saklar relay lampu atau notifikasi peringatan pintu terbuka.

### QoS 2: Exactly Once (Tepat Satu Kali / Jaminan Mutlak)
- **Cara Kerja**: Menggunakan mekanisme *four-step handshake* (`PUBLISH` -> `PUBREC` -> `PUBREL` -> `PUBCOMP`).
- **Karakteristik**: Protokol paling aman dan bebas dari pesan duplikat, tetapi memiliki latensi paling tinggi dan konsumsi bandwidth paling besar.
- **Contoh Kasus**: Sistem pembayaran, pemotongan kuota pulsa IoT, atau instruksi pembaruan firmware kritis (*OTA Update*).

---

## 3. Fitur Kritis: Retained Messages & Last Will and Testament (LWT)

### Retained Messages
Secara default, jika sebuah client baru melakukan subscribe ke suatu topik, client tersebut harus menunggu publisher mengirim data baru. Dengan mengaktifkan bendera **Retained Message**, broker akan menyimpan pesan terakhir pada topik tersebut. Begitu ada subscriber baru terhubung, broker langsung mengirimkan data terakhir tanpa perlu menunggu publisher aktif kembali.

### Last Will and Testament (LWT)
Fitur LWT dirancang untuk mendeteksi perangkat offline secara otomatis. Saat ESP32 pertama kali terhubung ke broker, ia mendaftarkan pesan wasiat LWT:
- Topik LWT: `devices/esp32-node1/status`
- Payload LWT: `offline`
- Retain: `true`

Jika ESP32 mati mendadak (misalnya kabel listrik terputus atau baterai habis tanpa sempat mengirim sinyal disconnect rapi), broker akan mendeteksi putusnya koneksi TCP *Keep-Alive* dan otomatis menyiarkan payload `offline` ke seluruh subscriber.

---

## 4. Implementasi Kontrol ESP32: Remote Restart & Reset WiFi

Berikut adalah implementasi firmware ESP32 berbasis Arduino framework / PlatformIO menggunakan pustaka `PubSubClient` dan `ArduinoJson`. 

Sistem ini berlangganan topik perintah `devices/esp32-01/command` untuk mengeksekusi instruksi:
1. `{"cmd": "restart"}`: Melakukan reboot perangkat lunak secara halus via `ESP.restart()`.
2. `{"cmd": "reset_wifi"}`: Menghapus kredensial SSID & Password yang tersimpan di memori NVS, lalu melakukan reboot ke mode konfigurasi awal.
3. `{"cmd": "ping"}`: Menjawab dengan status operasional dan waktu uptime perangkat.

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";

// Konfigurasi Broker MQTT
const char* mqtt_server = "192.168.1.100"; // IP VPS atau Docker Host Anda
const int mqtt_port = 1883;
const char* mqtt_user = "user_iot";
const char* mqtt_pass = "password_rahasia_123";

const char* device_id = "esp32-01";
const char* topic_command = "devices/esp32-01/command";
const char* topic_status = "devices/esp32-01/status";
const char* topic_telemetry = "devices/esp32-01/telemetry";

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastTelemetryTime = 0;

void setupWifi() {
  delay(10);
  Serial.println("\nMenghubungkan ke Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Terkoneksi! IP: " + WiFi.localIP().toString());
}

void publishStatus(const char* state) {
  // Publikasikan status perangkat dengan Retain = true
  client.publish(topic_status, state, true);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';

  Serial.print("Pesan perintah diterima [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Parsing JSON command
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.println("Gagal parsing JSON!");
    return;
  }

  const char* command = doc["cmd"];

  // 1. Eksekusi Perintah Remote Restart
  if (strcmp(command, "restart") == 0) {
    Serial.println("Perintah RESTART diterima. Menyiapkan reboot...");
    
    // Kirim konfirmasi balasan sebelum reboot
    client.publish(topic_status, "restarting", false);
    client.loop();
    delay(1000);
    
    ESP.restart();
  }

  // 2. Eksekusi Perintah Reset WiFi Credential
  else if (strcmp(command, "reset_wifi") == 0) {
    Serial.println("Perintah RESET WIFI diterima. Menghapus konfigurasi NVS...");
    
    client.publish(topic_status, "clearing_credentials", false);
    client.loop();
    delay(500);

    // Hapus kredensial Wi-Fi dari memori flash NVS ESP32
    WiFi.disconnect(true, true);
    delay(1000);

    Serial.println("Kredensial terhapus. Memulai ulang sistem...");
    ESP.restart();
  }

  // 3. Eksekusi Perintah Ping Diagnostic
  else if (strcmp(command, "ping") == 0) {
    StaticJsonDocument<128> response;
    response["status"] = "pong";
    response["uptime_sec"] = millis() / 1000;
    response["wifi_rssi"] = WiFi.RSSI();

    char responseBuffer[128];
    serializeJson(response, responseBuffer);
    client.publish(topic_status, responseBuffer, false);
  }
}

void reconnectMqtt() {
  while (!client.connected()) {
    Serial.print("Mencoba koneksi ke Broker MQTT...");
    
    // Daftarkan LWT (Last Will and Testament): jika putus, kirim "offline" (Retain = true)
    if (client.connect(device_id, mqtt_user, mqtt_pass, topic_status, 1, true, "offline")) {
      Serial.println(" Terhubung!");
      
      // Saat berhasil terhubung, publikasikan status "online"
      publishStatus("online");

      // Berlangganan topik perintah kontrol
      client.subscribe(topic_command, 1);
    } else {
      Serial.print(" Gagal, rc=");
      Serial.print(client.state());
      Serial.println(" Mencoba lagi dalam 5 detik...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setupWifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setupWifi();
  }

  if (!client.connected()) {
    reconnectMqtt();
  }
  client.loop();

  // Kirim data telemetri berkala setiap 10 detik
  if (millis() - lastTelemetryTime > 10000) {
    lastTelemetryTime = millis();

    StaticJsonDocument<128> telemetry;
    telemetry["device"] = device_id;
    telemetry["uptime"] = millis() / 1000;
    telemetry["free_heap"] = ESP.getFreeHeap();

    char buffer[128];
    serializeJson(telemetry, buffer);
    client.publish(topic_telemetry, buffer, false);
  }
}
```

---

## 5. Cara Instalasi Broker Mosquitto via Docker & Docker Compose

Docker adalah metode paling bersih, terisolasi, dan mudah dipindahkan antar server untuk menjalankan broker MQTT.

### Langkah 1: Buat Struktur Direktori
Buka terminal server Anda dan buat struktur folder kerja:

```bash
mkdir -p ~/iot-mqtt/mosquitto/config
mkdir -p ~/iot-mqtt/mosquitto/data
mkdir -p ~/iot-mqtt/mosquitto/log
cd ~/iot-mqtt
```

### Langkah 2: Buat Berkas Konfigurasi `mosquitto.conf`
Buat berkas konfigurasi di `~/iot-mqtt/mosquitto/config/mosquitto.conf`:

```conf
# Port standar MQTT TCP
listener 1883
protocol mqtt

# Port WebSocket untuk integrasi dashboard web browser
listener 9001
protocol websockets

# Keamanan dan Autentikasi
allow_anonymous false
password_file /mosquitto/config/passwd

# Penyimpanan Data Persisten & Log
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
log_dest stdout
```

### Langkah 3: Buat Berkas `docker-compose.yml`
Buat berkas `docker-compose.yml` di folder `~/iot-mqtt`:

```yaml
version: '3.8'

services:
  mosquitto:
    image: eclipse-mosquitto:2.0
    container_name: mqtt-broker
    restart: always
    ports:
      - "1883:1883"   # Port protokol MQTT TCP
      - "9001:9001"   # Port WebSocket
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log
    environment:
      - TZ=Asia/Jakarta
```

### Langkah 4: Buat Akun Pengguna & Jalankan Container
Sebelum container dinyalakan, buat berkas kata sandi awal dan enkripsi menggunakan utilitas `mosquitto_passwd`:

```bash
# Buat file passwd kosong
touch ~/iot-mqtt/mosquitto/config/passwd

# Jalankan container
docker compose up -d

# Buat username dan password terenkripsi di dalam container
docker exec -it mqtt-broker mosquitto_passwd -b /mosquitto/config/passwd user_iot password_rahasia_123

# Restart container agar konfigurasi pengguna aktif
docker compose restart
```

Status broker sekarang sudah berjalan aktif dan siap melayani koneksi dari perangkat ESP32 Anda.

---

## 6. Cara Instalasi Native Broker Mosquitto di VPS Ubuntu 22.04 / 24.04 LTS

Jika Anda mengelola VPS Linux Ubuntu mandiri tanpa Docker, ikuti langkah instalasi native berikut:

### Langkah 1: Pasang Paket Mosquitto
Buka sesi terminal SSH VPS Ubuntu Anda:

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients -y
```

### Langkah 2: Konfigurasi Keamanan dan Listener
Secara default pada versi Mosquitto 2.0 ke atas, broker hanya menerima koneksi dari `localhost` (127.0.0.1) jika belum dikonfigurasi. Buat berkas konfigurasi baru:

```bash
sudo nano /etc/mosquitto/conf.d/default.conf
```

Masukkan konfigurasi berikut:

```conf
listener 1883 0.0.0.0
allow_anonymous false
password_file /etc/mosquitto/passwd
```
Simpan berkas (`Ctrl+O`, lalu `Ctrl+X`).

### Langkah 3: Buat Akun Pengguna Terautentikasi
Gunakan perintah `mosquitto_passwd` untuk membuat user `user_iot`:

```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd user_iot
```
Masukkan password Anda saat diminta konfirmasi.

### Langkah 4: Konfigurasi Firewall UFW
Buka port 1883 agar dapat diakses oleh mikrokontroler dari luar jaringan:

```bash
sudo ufw allow 1883/tcp
sudo ufw reload
```

### Langkah 5: Jalankan dan Aktifkan Layanan Systemd
```bash
sudo systemctl enable mosquitto
sudo systemctl restart mosquitto
sudo systemctl status mosquitto
```

---

## 7. Pengujian Komunikasi MQTT dari Terminal

Untuk menguji apakah broker Anda berfungsi sempurna:

1. **Jalankan Subscriber (Penerima)** di jendela terminal 1:
   ```bash
   mosquitto_sub -h localhost -p 1883 -u "user_iot" -P "password_rahasia_123" -t "devices/+/status" -v
   ```

2. **Kirim Perintah Restart (Publisher)** di jendela terminal 2:
   ```bash
   mosquitto_pub -h localhost -p 1883 -u "user_iot" -P "password_rahasia_123" -t "devices/esp32-01/command" -m '{"cmd":"restart"}'
   ```

ESP32 Anda akan langsung merespon dengan pesan status `restarting` dan memulai ulang sistem secara instan.

---

## 8. Praktik Terbaik Keamanan Produksi (*Production Hardening*)

Untuk instalasi skala komersial industri:
1. **Gunakan Enkripsi TLS/SSL (Port 8883)**: Pasang sertifikat Let's Encrypt gratis menggunakan Certbot agar payload data sensor dan perintah kontrol terenkripsi penuh dari penyadapan jaringan (*man-in-the-middle attack*).
2. **Access Control List (ACL)**: Batasi hak akses topik per perangkat. Perangkat `esp32-01` hanya boleh mempublikasikan ke `devices/esp32-01/#` dan tidak boleh membaca topik milik perangkat lain.
3. **Pemberian ID Client Unik**: Selalu sertakan alamat MAC Address atau serial chip pada `device_id` (misalnya `ESP32_` + `WiFi.macAddress()`) untuk mencegah konflik koneksi terputus bergantian akibat duplikasi Client ID di broker.

---

## 9. Kesimpulan

Protokol MQTT menyediakan efisiensi dan fleksibilitas tanpa tanding untuk ekosistem IoT modern. Dengan memadukan pemahaman level QoS, fitur LWT untuk deteksi status offline, eksekusi perintah remote restart/reset pada ESP32, serta instalasi broker yang aman di Docker maupun VPS Ubuntu, Anda memiliki fondasi arsitektur IoT yang siap diandalkan untuk kebutuhan hobi hingga skala industri.
