---
title: "Membangun Sistem RAG Efisien Menggunakan PostgreSQL dan Ekstensi pgvector"
slug: "tutorial-rag-postgresql-pgvector-semantic-search"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["PostgreSQL", "pgvector", "RAG", "AI", "Database"]
summary: "Implementasi Retrieval-Augmented Generation (RAG) dan vector embeddings langsung di database PostgreSQL tanpa perlu database vektor terpisah."
readingTime: "7 menit baca"
---

Retrieval-Augmented Generation (RAG) telah menjadi arsitektur de facto untuk menyuntikkan basis pengetahuan eksternal ke dalam model bahasa kecerdasan buatan. Banyak tim pemula langsung berlangganan layanan database vektor khusus (*Pinecone, Qdrant, Milvus*), yang pada akhirnya menimbulkan kompleksitas sinkronisasi data antar dua sistem penyimpanan yang terpisah.

Padahal, jika aplikasi Anda sudah menggunakan **PostgreSQL**, Anda dapat memanfaatkan ekstensi resmi bernama **pgvector**. Dengan pgvector, data relasional bisnis dan vektor embedding numerik berada di bawah satu atap transaksi ACID yang sama.

Tutorial ini akan memandu Anda menyiapkan tabel vektor di PostgreSQL, menghasilkan embedding teks, serta mengeksekusi pencarian kemiripan semantik (*semantic similarity search*).

---

## 1. Menyiapkan PostgreSQL dengan Ekstensi pgvector

Cara paling cepat untuk memulai di lingkungan lokal adalah menggunakan container Docker resmi pgvector:

```bash
docker run -d \
  --name postgres-vector \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=rahasia123 \
  -e POSTGRES_DB=rag_knowledge \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

Hubungkan terminal Anda ke database melalui `psql` dan aktifkan ekstensi vektor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Periksa apakah tipe data `vector` sudah siap digunakan:

```sql
SELECT typname FROM pg_type WHERE typname = 'vector';
```

---

## 2. Merancang Skema Database Dokumen & Embeddings

Buat tabel untuk menampung artikel panduan atau dokumen pengetahuan:

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    chunk_content TEXT NOT NULL,
    -- Dimensi 1536 cocok untuk text-embedding-3-small dari OpenAI
    -- Dimensi 768 cocok untuk model open-source seperti nomic-embed-text
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Membuat Indeks Pencarian Vektor: HNSW vs IVFFlat
Pencarian vektor tanpa indeks akan melakukan pemindaian menyeluruh (*exact brute-force search*). Untuk dataset di atas 10.000 baris, Anda wajib membuat indeks aproksimasi tetangga terdekat (ANN).

**Hierarchical Navigable Small World (HNSW)** adalah indeks standar industri modern yang menawarkan recall akurasi tinggi dan latensi query di bawah 5 milidetik:

```sql
CREATE INDEX ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

Operator `vector_cosine_ops` digunakan karena kita akan mengukur kemiripan makna dokumen berdasarkan sudut kosinus (*Cosine Distance*).

---

## 3. Menghasilkan Embeddings dan Menyimpan Dokumen

Kita gunakan script Node.js sederhana untuk membaca potongan teks, memanggil embedding model lokal atau API, dan menyimpannya ke database:

```typescript
import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:rahasia123@localhost:5432/rag_knowledge',
});

await client.connect();

// Simulasi fungsi pembuat embedding (768 dimensi numerik)
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text,
    }),
  });
  const data = await response.json();
  return data.embedding;
}

const articles = [
  {
    title: 'Konfigurasi Port Mikrokontroler ESP32',
    content: 'Pin GPIO 21 dan 22 pada ESP32 secara default dialokasikan sebagai jalur komunikasi protokol I2C (SDA dan SCL).',
  },
  {
    title: 'Manajemen Risiko Trading Forex MQL5',
    content: 'Fungsi AccountInfoDouble(ACCOUNT_EQUITY) digunakan untuk membaca nilai saldo mengambang saat membatasi risiko kerugian.',
  },
];

for (const doc of articles) {
  const vector = await generateEmbedding(doc.content);
  // Format vektor untuk pgvector adalah string array: "[0.12, -0.05, 0.89, ...]"
  const vectorStr = `[${vector.join(',')}]`;

  await client.query(
    'INSERT INTO documents (title, chunk_content, embedding) VALUES ($1, $2, $3)',
    [doc.title, doc.content, vectorStr]
  );
}

console.log('Seluruh dokumen berhasil diindeks ke PostgreSQL pgvector.');
await client.end();
```

---

## 4. Melakukan Semantic Similarity Search

Ketika pengguna mengajukan pertanyaan natural:

> *"Bagaimana cara membaca modal akun di robot trading?"*

Kita ubah pertanyaan tersebut menjadi vektor embedding, lalu cari dokumen dengan jarak kosinus terdekat menggunakan operator `<=>`:

```sql
SELECT 
    id, 
    title, 
    chunk_content, 
    -- Jarak kosinus berkisar antara 0 (identik) hingga 2 (berlawanan)
    -- Kemiripan kosinus = 1 - jarak kosinus
    1 - (embedding <=> '[0.045, -0.123, 0.781, ...]'::vector) AS similarity_score
FROM documents
ORDER BY embedding <=> '[0.045, -0.123, 0.781, ...]'::vector
LIMIT 3;
```

Meskipun pertanyaan pengguna menggunakan frasa *"modal akun"* dan dokumen berisi kata *"saldo mengambang"*, mesin vektor tetap mengenali hubungan semantiknya dan mengembalikan artikel MQL5 di urutan teratas.

---

## 5. Mengirimkan Konteks Dokumen ke Prompt LLM

Potongan teks yang berhasil ditarik (*retrieved*) selanjutnya disematkan ke dalam prompt LLM:

```text
Gunakan dokumen referensi berikut untuk menjawab pertanyaan pengguna:

[DOKUMEN 1]
Judul: Manajemen Risiko Trading Forex MQL5
Isi: Fungsi AccountInfoDouble(ACCOUNT_EQUITY) digunakan untuk membaca nilai saldo mengambang...

Pertanyaan: Bagaimana cara membaca modal akun di robot trading?
Jawaban:
```

Hasil jawaban model AI kini didasari data faktual konkret (*grounded truth*) dari database Anda, memangkas risiko halusinasi hingga titik terendah.

---

## Kesimpulan

Menggunakan PostgreSQL dengan pgvector menghilangkan beban pemeliharaan infrastruktur data terpisah. Anda mendapatkan kecepatan pencarian vektor modern berpadu dengan keandalan filter relasional SQL klasik, menjadikannya fondasi paling solid untuk aplikasi RAG di era modern.
