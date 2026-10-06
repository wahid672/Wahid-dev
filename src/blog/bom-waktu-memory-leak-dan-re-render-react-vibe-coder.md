---
title: "Bom Waktu Memory Leak dan Re-render Tak Terkontrol pada Frontend Vibe Coder"
slug: "bom-waktu-memory-leak-dan-re-render-react-vibe-coder"
date: "2026-10-06"
author: "Wahid Alimudin"
category: "Rekayasa Perangkat Lunak"
tags: ["Vibe Coding", "React", "Memory Leak", "useEffect", "Frontend Performance", "Re-render"]
summary: "Bagaimana kebiasaan vibe coding menghasilkan rantai re-render tanpa batas, subscription zombie, kebocoran memori akibat useEffect tanpa cleanup, dan cara memperbaikinya."
readingTime: "9 menit baca"
---

Bagi para *vibe coder*, antarmuka pengguna berbasis React, Next.js, atau Vue adalah arena bermain paling menyenangkan. Cukup ketik: *"Tambahkan widget notifikasi real-time, buat animasi grafik yang bergerak setiap detik, dan buatkan dropdown filter data"*, dan dalam beberapa detik komponen visual yang interaktif langsung muncul di layar monitor.

Namun, di balik tampilan antarmuka yang tampak responsif saat pertama kali dibuka, sering kali tersembunyi bom waktu kinerja: **Kebocoran Memori (Memory Leaks)** dan **Rantai Re-render Tanpa Henti (Cascading Re-renders)**.

Ketika pengguna membuka aplikasi Anda selama lebih dari 10 menit, kipas pendingin laptop mereka mulai berputar kencang, browser Chrome menghabiskan memori RAM hingga 2 GB, dan transisi halaman mulai terasa patah-patah (*laggy*). Masalah ini hampir selalu berakar pada ketidakpahaman vibe coder terhadap siklus hidup (*lifecycle*) komponen React.

---

## 1. Dosa Terbesar: Hook `useEffect` Tanpa Fungsi Pembersih (Cleanup Function)

Model AI sering kali menghasilkan kode yang memasang pendengar peristiwa (*event listener*), interval waktu (`setInterval`), atau koneksi WebSocket di dalam hook `useEffect`, namun **lupa menyertakan fungsi pembersih saat komponen dilepas (*unmounted*)**.

Perhatikan contoh kode yang umum dihasilkan AI:

```tsx
// CONTOH KODE BOCOR: Menyebabkan Memory Leak
export function LiveMetricsWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Memasang interval untuk polling data setiap 2 detik
    const timer = setInterval(() => {
      fetch('/api/metrics')
        .then((res) => res.json())
        .then((json) => setData(json));
    }, 2000);

    // KESALAHAN FATAL: Tidak ada 'return () => clearInterval(timer)'!
  }, []);

  return <div>Metrics: {JSON.stringify(data)}</div>;
}
```

### Mengapa Kode Ini Sangat Berbahaya?
Setiap kali pengguna berpindah ke halaman lain lalu kembali lagi ke halaman widget ini, interval lama tidak pernah dimatikan. 
* Kunjungan ke-1: Ada 1 interval berjalan di latar belakang.
* Kunjungan ke-5: Ada 5 interval terpisah yang berjalan serentak mengirimkan permintaan jaringan ke server.
* Kunjungan ke-20: Browser kehabisan memori dan terjadi error *Target closed* atau tab browser membeku total (*freeze*).

### Solusi Wajib: Selalu Bersihkan Sumber Daya:

```tsx
// KODE AMAN: Dilengkapi Cleanup Function
useEffect(() => {
  const timer = setInterval(() => {
    fetch('/api/metrics')
      .then((res) => res.json())
      .then((json) => setData(json));
  }, 2000);

  // Wajib mengembalikan fungsi pembersih
  return () => {
    clearInterval(timer);
  };
}, []);
```

---

## 2. Jebakan Rantai Re-render: Array Dependensi yang Salah

Masalah klasik kedua adalah perulangan re-render tak berujung (*infinite loop re-renders*) yang dipicu oleh mutasi state di dalam efek yang bergantung pada state itu sendiri, atau akibat penggunaan objek/fungsi baru yang dibuat ulang di setiap render:

```tsx
// CONTOH KODE INFINITE RE-RENDER
export function UserProfile({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<any>(null);

  // Bahaya: options dibuat sebagai objek baru di setiap render!
  const queryOptions = { includeAvatar: true };

  useEffect(() => {
    fetchProfile(userId, queryOptions).then((data) => {
      setProfile(data); // Memicu re-render -> queryOptions dibuat baru -> efek jalan lagi!
    });
  }, [userId, queryOptions]); // queryOptions selalu dianggap beda referensi memori

  return <div>{profile?.name}</div>;
}
```

### Solusi: Stabilkan Referensi dengan `useMemo` atau Primitive Value
Jangan memasukkan objek atau array anonim ke dalam daftar dependensi `useEffect`. Ekstrak nilainya menjadi tipe data primitif, atau bungkus dengan `useMemo` / `useCallback`.

---

## 3. Bahaya State Bloat: Menaruh Semua Data di State Global

Ketika vibe coder bingung bagaimana cara membagikan data antara dua komponen, instruksi termudah yang mereka berikan ke AI adalah:
> *"Simpan data ini di Zustand / Redux / React Context global agar bisa diakses di mana saja."*

Hasilnya adalah antarmuka yang menderita **State Bloat**. Ketika ada satu huruf diketik di formulir pencarian, seluruh pohon komponen aplikasi dari navigasi atas hingga footer bawah ikut melakukan *re-render* yang sama sekali tidak diperlukan.

### Prinsip Colocation: Tarik State Sedekat Mungkin ke Komponen yang Membutuhkannya:

```text
[Aplikasi Global]
       |
[Halaman Dashboard]
       |
[Komponen Filter Tabel] ---> (Cukup simpan state ketikan filter di sini!)
```

Jika suatu data hanya digunakan oleh satu modal kecil atau satu kotak input, simpanlah data tersebut di state lokal (`useState` lokal), bukan di state global.

---

## 4. Cara Mendeteksi Re-render Boros dengan React DevTools Profiler

Jangan menunggu pengguna komplain laptop mereka lambat. Anda dapat mengaudit kesehatan komponen antarmuka Anda secara mandiri:

1. Buka aplikasi Anda di browser Google Chrome.
2. Buka DevTools (F12), lalu pilih tab **Profiler** (bagian dari ekstensi resmi React Developer Tools).
3. Centang opsi **"Record why each component rendered"** di menu pengaturan gear.
4. Klik tombol rekam (*Start Profiling*), lakukan interaksi biasa di aplikasi Anda (misal mengklik tombol atau mengetik teks), lalu tekan tombol stop.
5. Perhatikan grafik berwarna kuning dan merah:
   * Jika sebuah tombol diklik dan menyebabkan 40 komponen lain yang tidak relevan ikut dirender ulang, itu adalah tanda pasti Anda harus menerapkan pemisahan komponen atau membungkus komponen berat dengan `React.memo()`.

Menjaga kebersihan siklus hidup komponen dan manajemen memori frontend memastikan aplikasi modern Anda tidak hanya memikat secara visual, tetapi juga ringan dan hemat baterai di perangkat pengguna nyata.
