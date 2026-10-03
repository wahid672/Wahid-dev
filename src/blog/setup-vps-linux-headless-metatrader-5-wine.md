---
title: "Cara Menjalankan MetaTrader 5 di Server Linux VPS Menggunakan Wine Headless"
slug: "setup-vps-linux-headless-metatrader-5-wine"
date: "2026-08-08"
author: "Wahid Alimudin"
category: "DevOps & Server"
tags: ["MetaTrader 5", "Linux", "Ubuntu", "Wine", "VPS", "DevOps"]
summary: "Panduan teknis menjalankan terminal MT5 di server Linux Ubuntu tanpa antarmuka GUI desktop menggunakan Wine dan Xvfb, lengkap dengan systemd auto-restart service."
readingTime: "6 menit baca"
---

# Cara Menjalankan MetaTrader 5 di Server Linux VPS Menggunakan Wine Headless

Menjalankan robot trading Expert Advisor (EA) MetaTrader 5 membutuhkan koneksi internet berlatensi rendah dan pasokan listrik tanpa henti selama 24 jam sehari, 5 hari seminggu. Sementara VPS Windows berharga relatif lebih mahal karena lisensi OS, server **Linux VPS (Ubuntu Server)** berbiaya jauh lebih hemat dan mengonsumsi RAM yang jauh lebih sedikit.

Dalam artikel ini, kita akan mengonfigurasi terminal MetaTrader 5 di atas Ubuntu 24.04 LTS menggunakan **Wine** dan **Xvfb (X Virtual Framebuffer)**.

---

## 1. Persiapan Server dan Instalasi Dependensi

Jalankan pembaruan paket dan pasang arsitektur 32-bit serta Wine pada server Ubuntu Anda:

```bash
sudo apt update && sudo apt upgrade -y
sudo dpkg --add-architecture i386

# Pasang Wine dan virtual framebuffer
sudo apt install -y wine64 wine32 xvfb xdotool wget
```

---

## 2. Mengunduh dan Memasang Terminal MetaTrader 5

Unduh installer resmi `mt5setup.exe` langsung dari MetaQuotes:

```bash
cd /tmp
wget https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe

# Buat virtual display menggunakan Xvfb pada port :99
Xvfb :99 -screen 0 1024x768x16 &
export DISPLAY=:99

# Jalankan instalasi tanpa jendela GUI fisik
wine mt5setup.exe /auto
```

Installer akan otomatis membuat folder instalasi di `~/.wine/drive_c/Program Files/MetaTrader 5/terminal64.exe`.

---

## 3. Membuat Systemd Service untuk Menjamin Uptime 24/7

Agar terminal MT5 otomatis berjalan kembali jika server restart atau terjadi crash, buat berkas service systemd:

```bash
sudo nano /etc/systemd/system/mt5.service
```

Isi dengan konfigurasi berikut:

```ini
[Unit]
Description=MetaTrader 5 Headless Trading Service
After=network.target

[Service]
Type=simple
User=ubuntu
Environment="DISPLAY=:99"
Environment="WINEPREFIX=/home/ubuntu/.wine"
ExecStartPre=/usr/bin/Xvfb :99 -screen 0 1024x768x16
ExecStart=/usr/bin/wine "/home/ubuntu/.wine/drive_c/Program Files/MetaTrader 5/terminal64.exe" /portable
Restart=always
RestartSec=10
KillMode=process

[Install]
WantedBy=multi-user.target
```

Aktifkan dan jalankan service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mt5.service
sudo systemctl start mt5.service
```

---

## 4. Tips Menghemat Konsumsi RAM di Linux VPS

Terminal MT5 dapat berjalan dengan konsumsi RAM serendah **70 MB** jika Anda menerapkan konfigurasi ini pada file `terminal.ini` atau pengaturan chart:
- **Batasi Maksimal Bar di Chart**: Ubah pengaturan `Max bars in chart` dari 100.000 menjadi 5.000 bar.
- **Sembunyikan Simbol yang Tidak Dipakai**: Sembunyikan semua pair di panel Market Watch kecuali simbol yang aktif ditradingkan oleh EA Anda.
- **Matikan Audio Alert**: Menonaktifkan efek suara sistem mengurangi beban threading Wine.

---

## Kesimpulan

Menjalankan MetaTrader 5 dengan Wine dan Xvfb di server Linux VPS adalah solusi ekonomis dan efisien untuk menjaga robot trading MQL5 Anda tetap online sepanjang waktu dengan uptime maksimal.
