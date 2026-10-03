---
title: "Arsitektur Sistem PSB Online: Alur Verifikasi Berkas dan Pembayaran Otomatis"
slug: "arsitektur-psb-online-verifikasi-berkas-dan-pembayaran"
date: "2026-08-01"
author: "Wahid Alimudin"
category: "Web Development"
tags: ["Architecture", "SaaS", "PSB Online", "Node.js", "Storage", "Security"]
summary: "Bedah arsitektur platform penerimaan santri baru online: alur pendaftaran responsif, enkripsi berkas dokumen identitas santri, dan notifikasi status otomatis via WhatsApp."
readingTime: "6 menit baca"
---

# Arsitektur Sistem PSB Online: Alur Verifikasi Berkas dan Pembayaran Otomatis

Penerimaan Santri Baru (PSB) atau Penerimaan Peserta Didik Baru (PPDB) adalah momen krusial tahunan bagi lembaga pendidikan. Sistem manual yang mengandalkan formulir kertas dan konfirmasi via chat WhatsApp pribadi sering menyebabkan antrean panjang, bukti transfer hilang, dan data berkas tidak teratur.

Melalui platform [psbonline.id](https://psbonline.id), alur kerja tersebut disederhanakan menjadi sistem terpadu yang dapat diakses oleh wali santri dari mana saja. Artikel ini membedah arsitektur sistem di balik platform tersebut.

---

## 1. Alur Kerja Pendaftaran 4 Tahap

Untuk memaksimalkan tingkat penyelesaian pendaftaran oleh calon wali murid melalui perangkat ponsel pintar, alur pengisian form dibagi menjadi empat tahapan terstruktur:

1. **Tahap 1: Registrasi Akun Singkat**: Calon wali santri cukup memasukkan nomor WhatsApp aktif, nama anak, dan kata sandi. Kode OTP dikirimkan otomatis melalui WhatsApp.
2. **Tahap 2: Pengisian Biodata Siswa & Orang Tua**: Informasi identitas dasar, riwayat sekolah asal, dan nomor NISN / NIK.
3. **Tahap 3: Unggah Dokumen Berkas**: Foto Kartu Keluarga (KK), Akta Kelahiran, dan Ijazah Terakhir dengan kompresi gambar otomatis pada sisi browser (*client-side image compression*) untuk menghemat kuota internet pendaftar.
4. **Tahap 4: Pembayaran Biaya Pendaftaran**: Pembuatan nomor Virtual Account atau QRIS dinamis yang otomatis terverifikasi tanpa perlu konfirmasi manual admin.

---

## 2. Penyimpanan dan Keamanan Berkas Dokumen (Object Storage S3)

Berkas identitas kependudukan santri seperti Kartu Keluarga dan Akta Kelahiran merupakan data pribadi sensitif yang harus dilindungi secara ketat.

### Praktik Keamanan Penyimpanan:
- **Jangan Simpan di Folder Publik Web Server**: Berkas tidak boleh disimpan di folder publik seperti `/public/uploads/` yang dapat diakses sembarang orang jika mengetahui nama file.
- **Gunakan Private S3 Bucket dengan Presigned URL**: Berkas diunggah ke Object Storage (seperti Cloudflare R2 atau AWS S3) dengan akses *private*. Akses unduh oleh panitia hanya diberikan melalui URL berbatas waktu (*presigned URL*) yang kedaluwarsa dalam 15 menit.

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
});

export const generateSecureDocumentViewUrl = async (
  documentStorageKey: string,
  userRole: string
): Promise<string> => {
  // Hanya panitia terotentikasi yang diizinkan menghasilkan URL
  if (userRole !== 'panitia_psb' && userRole !== 'super_admin') {
    throw new Error('Akses ditolak');
  }

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: documentStorageKey
  });

  // URL hanya valid selama 900 detik (15 menit)
  return await getSignedUrl(s3Client, command, { expiresIn: 900 });
};
```

---

## 3. Otomasi Pengumuman Kelulusan via WhatsApp Gateway

Ketika tim panitia seleksi mengubah status pendaftaran (misal dari `MENUNGGU_VERIFIKASI` menjadi `LULUS_SELEKSI`), event database langsung menerbitkan pesan antrean ke modul [wanotif.web.id](https://wanotif.web.id):

```text
Selamat Bpk/Ibu [Nama_Wali],
Calon santri an. [Nama_Santri] dinyatakan LULUS seleksi PSB Gelombang 1.
Silakan unduh Surat Keputusan dan rincian daftar ulang di: psbonline.id/status/[Kode_Pendaftaran]
```

---

## Kesimpulan

Arsitektur sistem pendaftaran modern yang menggabungkan *client-side image compression*, penyimpanan cloud privat berbasis *presigned URL*, dan notifikasi instan WhatsApp memberikan pengalaman yang profesional bagi wali santri sekaligus meringankan beban kerja administrasi panitia sekolah.
