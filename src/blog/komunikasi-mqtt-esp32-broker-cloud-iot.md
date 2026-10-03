---
title: "Protokol MQTT pada ESP32: Mengirimkan Data Telemetri Sensor ke Cloud Broker"
slug: "komunikasi-mqtt-esp32-broker-cloud-iot"
date: "2026-09-14"
author: "Wahid Alimudin"
category: "IoT & Hardware"
tags: ["ESP32", "MQTT", "IoT", "EMQX", "Sensor", "C++"]
summary: "Pelajari cara mengimplementasikan protokol MQTT berbasis publish-subscribe pada mikrokontroler ESP32 menggunakan library PubSubClient untuk transmisi data hemat daya."
readingTime: "5 menit baca"
---

# Protokol MQTT pada ESP32: Mengirimkan Data Telemetri Sensor ke Cloud Broker

Protokol HTTP sering kali terlalu berat untuk perangkat Internet of Things (IoT) bertenaga baterai karena overhead header paket TCP yang besar dan sifat komunikasi request-response satu arah. **MQTT (Message Queuing Telemetry Transport)** dirancang khusus untuk perangkat berdaya rendah dengan bandwidth jaringan terbatas menggunakan model arsitektur *publish/subscribe*.

Artikel ini mendemonstrasikan cara menghubungkan ESP32 ke broker MQTT (seperti Mosquitto atau EMQX Cloud) dan mengirimkan data telemetri berkala.

---

## 1. Keunggulan MQTT Dibanding HTTP untuk IoT

- **Ukuran Header Sangat Ringkas**: Header paket MQTT hanya berukuran 2 byte, dibandingkan dengan header HTTP yang mencapai ratusan byte per transaksi.
- **Koneksi Persisten (Keep-Alive)**: Tidak perlu melakukan TCP 3-way handshake berulang kali setiap kali sensor membaca nilai baru.
- **Kualitas Layanan (QoS Levels)**: Mendukung pilihan pengiriman pesan QoS 0 (At most once), QoS 1 (At least once), dan QoS 2 (Exactly once).

---

## 2. Firmware ESP32 dengan Library PubSubClient

Pastikan pustaka **PubSubClient** dan **WiFi** telah terpasang di lingkungan pengembangan Anda:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "NAMA_WIFI";
const char* password = "PASSWORD_WIFI";

// Konfigurasi Broker MQTT
const char* mqttServer = "broker.emqx.io";
const int mqttPort = 1883;
const char* mqttTopicTelemetry = "pesantren/iot/sensor-01/telemetry";

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsgTime = 0;

void setup() {
  Serial.begin(115200);
  setupWifi();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);
}

void setupWifi() {
  delay(10);
  Serial.println("Menghubungkan ke Wi-Fi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi terhubung!");
}

void reconnectMqtt() {
  while (!client.connected()) {
    Serial.print("Mencoba koneksi MQTT...");
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("Terhubung ke MQTT Broker!");
      // Berlangganan topik kontrol jika diperlukan
      client.subscribe("pesantren/iot/sensor-01/command");
    } else {
      Serial.print("Gagal, status rc=");
      Serial.print(client.state());
      Serial.println(" Mencoba lagi dalam 5 detik...");
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Pesan masuk pada topik [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void loop() {
  if (!client.connected()) {
    reconnectMqtt();
  }
  client.loop();

  // Kirim data sensor setiap 10 detik
  unsigned long now = millis();
  if (now - lastMsgTime > 10000) {
    lastMsgTime = now;

    // Simulasi pembacaan data sensor suhu & tegangan baterai
    float suhu = 28.5 + (random(0, 20) / 10.0);
    float voltaseBaterai = 3.95;

    char payloadBuffer[128];
    snprintf(payloadBuffer, sizeof(payloadBuffer),
             "{\"temp\":%.2f,\"battery\":%.2f,\"rssi\":%d}",
             suhu, voltaseBaterai, WiFi.RSSI());

    client.publish(mqttTopicTelemetry, payloadBuffer);
    Serial.print("Data dipublish: ");
    Serial.println(payloadBuffer);
  }
}
```

---

## 3. Integrasi ke Dashboard Web Real-Time

Data yang dipublikasikan oleh ESP32 ke broker MQTT dapat langsung diteruskan ke dashboard web (seperti React) menggunakan koneksi **WebSocket MQTT** (`ws://` atau `wss://`). Hal ini memungkinkan grafik suhu, status RFID, atau level daya baterai diperbarui secara langsung tanpa refresh halaman.

---

## Kesimpulan

Penggunaan MQTT pada mikrokontroler ESP32 menghasilkan sistem IoT yang hemat daya, memiliki latensi rendah, dan sangat skalabel saat jumlah perangkat bertambah dari puluhan menjadi ribuan simpul sensor.
