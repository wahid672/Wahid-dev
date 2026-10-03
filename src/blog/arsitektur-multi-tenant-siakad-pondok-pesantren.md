---
title: "Merancang Arsitektur Multi-Tenant SIAKAD Pondok Pesantren yang Aman dan Skalabel"
slug: "arsitektur-multi-tenant-siakad-pondok-pesantren"
date: "2026-09-10"
author: "Wahid Alimudin"
category: "Web Development"
tags: ["Architecture", "SaaS", "Multi-Tenant", "PostgreSQL", "Node.js", "SIAKAD"]
summary: "Kupas tuntas strategi partisi data multi-tenant untuk platform Sistem Informasi Akademik (SIAKAD) Pesantren: perbandingan Schema-per-Tenant versus Shared Database dengan Row-Level Security."
readingTime: "8 menit baca"
---

# Merancang Arsitektur Multi-Tenant SIAKAD Pondok Pesantren yang Aman dan Skalabel

Dalam merancang platform Software as a Service (SaaS) manajemen pesantren seperti [siakadponpes.com](https://siakadponpes.com), tantangan fundamental yang dihadapi adalah bagaimana melayani puluhan hingga ratusan lembaga pendidikan pesantren dalam satu sistem tanpa resiko kebocoran data antar-lembaga.

Artikel ini membahas pertimbangan arsitektur database multi-tenant, strategi isolasi data, serta implementasi middleware isolasi tenant pada backend Node.js dan PostgreSQL.

---

## 1. Tiga Pendekatan Arsitektur Multi-Tenancy

Ada tiga pola umum dalam mendesain sistem multi-tenant:

1. **Database-per-Tenant**: Setiap pesantren memiliki database terpisah secara fisik. Paling aman, namun biaya infrastruktur dan beban migrasi skema database sangat berat saat jumlah penyewa mencapai ratusan.
2. **Schema-per-Tenant**: Satu database bersama, tetapi setiap pesantren memiliki skema terisolasi di PostgreSQL (`CREATE SCHEMA tenant_a;`). Menawarkan isolasi logis yang kuat dan fleksibilitas query.
3. **Shared Database & Shared Schema (Row-Level Security / RLS)**: Semua data pesantren berada di tabel yang sama, dibedakan oleh kolom `tenant_id`. Sangat hemat sumber daya komputasi dan pemeliharaan mudah, asalkan validasi query sangat ketat.

---

## 2. Implementasi Middleware Identifikasi Tenant (Subdomain & Domain Kustom)

Langkah awal adalah mengidentifikasi identitas tenant dari request HTTP yang masuk (misalnya `pesantren-alikhlas.siakadponpes.com` atau domain kustom resmi mereka).

Berikut adalah contoh middleware Node.js TypeScript:

```typescript
import { Request, Response, NextFunction } from 'express';
import { getTenantConfigByHost } from './tenantRegistry';

export interface TenantContext {
  id: string;
  code: string;
  name: string;
  dbSchema: string;
  subdomain: string;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

export const tenantResolutionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hostname = req.hostname.toLowerCase();
    
    // Abaikan permintaan domain utama portal publik
    if (hostname === 'siakadponpes.com' || hostname === 'www.siakadponpes.com') {
      return next();
    }

    // Ambil konfigurasi tenant dari cache Redis atau database master
    const tenant = await getTenantConfigByHost(hostname);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Lembaga pesantren tidak ditemukan atau domain belum terverifikasi.'
      });
    }

    // Tempelkan konteks tenant ke objek request
    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};
```

---

## 3. Isolasi Query Database dengan PostgreSQL Search Path

Jika Anda memilih model *Schema-per-Tenant*, kita dapat mengarahkan koneksi transaksi database untuk langsung mengunci schema tenant yang aktif:

```typescript
import { Pool, PoolClient } from 'pg';
import { TenantContext } from './tenantResolutionMiddleware';

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const runTenantQuery = async <T>(
  tenant: TenantContext,
  queryFn: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await dbPool.connect();
  try {
    // Kunci search path hanya ke schema tenant dan public
    await client.query(`SET search_path TO "${tenant.dbSchema}", public;`);
    
    // Jalankan query transaksi
    const result = await queryFn(client);
    return result;
  } finally {
    // Reset search path sebelum koneksi dikembalikan ke connection pool
    await client.query('RESET search_path;');
    client.release();
  }
};
```

---

## 4. Keamanan Cadangan Data Otomatis (Automated Backup per Tenant)

Salah satu tuntutan pengelola pondok pesantren adalah kemampuan untuk mengunduh arsip data santri dan tagihan mereka secara berkala. Dengan model skema terpisah, kita dapat memanfaatkan perintah `pg_dump` dengan flag `--schema`:

```bash
pg_dump -h localhost -U postgres -n "tenant_pesantren_xyz" siakad_db > backup_xyz.sql
```

Proses ini sangat cepat dan dapat dijalankan otomatis setiap pergantian semester tanpa mengganggu operasional tenant pesantren lainnya.

---

## Kesimpulan

Model *Schema-per-Tenant* pada PostgreSQL menawarkan titik temu seimbang antara efisiensi biaya server dan jaminan isolasi keamanan data institusi pendidikan pesantren.
