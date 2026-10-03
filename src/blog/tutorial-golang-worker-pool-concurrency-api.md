---
title: "Desain High-Concurrency Worker Pool di Golang Menggunakan Goroutine dan Channel"
slug: "tutorial-golang-worker-pool-concurrency-api"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["Golang", "Concurrency", "Backend", "Performance", "API"]
summary: "Panduan membuat arsitektur worker pool terkontrol di Go untuk memproses ribuan antrean tugas berat secara paralel tanpa lonjakan memori."
readingTime: "7 menit baca"
---

Salah satu keunggulan terbesar bahasa pemrograman Go (Golang) adalah ringannya alokasi goroutine, yang hanya memakan memori sekitar 2 KB saat pertama kali dibuat. Karena kemudahan ini, pengembang pemula sering kali terjebak dalam pola anti-pattern: memicu `go process(item)` secara liar untuk setiap HTTP request yang masuk.

Ketika beban trafik melonjak hingga 50.000 permintaan per detik, puluhan ribu goroutine yang aktif secara bersamaan akan memperebutkan koneksi database, menghabiskan memori RAM, dan memicu *Out-Of-Memory (OOM) panic*.

Solusi arsitektur yang benar untuk menangani beban tinggi adalah pola **Worker Pool Terkontrol**. Dalam tutorial ini, kita akan merancang antrean tugas paralel di Go dengan alokasi pekerja yang terukur, penanganan graceful shutdown, dan pembatasan konkurensi.

---

## 1. Konsep Dasar Worker Pool di Go

Worker pool membagi tanggung jawab sistem menjadi tiga komponen:
1. **Job Queue (Buffered Channel):** Antrean penampung tugas sementara yang dikirimkan oleh produsen (*producer*).
2. **Workers (Goroutines):** Sejumlah goroutine tetap yang terus-menerus mendengarkan dan mengambil pekerjaan dari saluran antrean.
3. **Dispatcher & WaitGroup:** Koordinator yang mengontrol siklus hidup pekerja dan memastikan seluruh pekerjaan rampung sebelum aplikasi berhenti.

---

## 2. Implementasi Lengkap Worker Pool di Go

Buat berkas `main.go` dan tulis implementasi arsitektur worker pool berikut:

```go
package main

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

// 1. Definisi Entitas Tugas (Job) dan Hasil (Result)
type Job struct {
	ID        int
	Payload   string
	CreatedAt time.Time
}

type Result struct {
	JobID       int
	ProcessedBy int
	Duration    time.Duration
	Err         error
}

// 2. Fungsi Pekerja (Worker Function)
func worker(ctx context.Context, id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()

	for {
		select {
		case <-ctx.Done():
			// Berhenti dengan aman jika sinyal shutdown diterima
			fmt.Printf("[Worker %d] Menerima sinyal berhenti, menghentikan loop.\n", id)
			return
		case job, ok := <-jobs:
			if !ok {
				// Saluran job telah ditutup oleh produsen
				return
			}

			start := time.Now()
			// Simulasi komputasi berat (misal: encode video atau kalkulasi analitik)
			workDuration := time.Duration(100+rand.Intn(150)) * time.Millisecond
			time.Sleep(workDuration)

			results <- Result{
				JobID:       job.ID,
				ProcessedBy: id,
				Duration:    time.Since(start),
				Err:         nil,
			}
		}
	}
}

func main() {
	// Konfigurasi Parameter Pool
	const numWorkers = 5
	const numJobs = 30
	const queueCapacity = 100

	jobs := make(chan Job, queueCapacity)
	results := make(chan Result, queueCapacity)

	// Context untuk koordinasi Graceful Shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var workerWg sync.WaitGroup

	// Menyalakan sejumlah goroutine pekerja yang telah ditentukan
	fmt.Printf("Menyalakan %d unit pekerja...\n", numWorkers)
	for w := 1; w <= numWorkers; w++ {
		workerWg.Add(1)
		go worker(ctx, w, jobs, results, &workerWg)
	}

	// Goroutine terpisah untuk mengonsumsi dan mencetak hasil
	var resultWg sync.WaitGroup
	resultWg.Add(1)
	go func() {
		defer resultWg.Done()
		for res := range results {
			if res.Err != nil {
				fmt.Printf("[ERROR] Job %d gagal: %v\n", res.JobID, res.Err)
			} else {
				fmt.Printf("[SUKSES] Job %d diselesaikan oleh Worker %d dalam waktu %v\n",
					res.JobID, res.ProcessedBy, res.Duration)
			}
		}
	}()

	// Menangkap sinyal terminate (Ctrl+C atau SIGTERM)
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	// Simulasi pengiriman tugas oleh Produsen (Producer)
	go func() {
		for i := 1; i <= numJobs; i++ {
			select {
			case <-ctx.Done():
				fmt.Println("Produsen berhenti mengirim job karena shutdown.")
				return
			case jobs <- Job{
				ID:        i,
				Payload:   fmt.Sprintf("Data transaksi #%d", i),
				CreatedAt: time.Now(),
			}:
			}
		}
		// Tutup saluran job setelah seluruh data selesai dikirim
		close(jobs)
	}()

	// Menunggu selesai atau menunggu sinyal shutdown
	select {
	case <-shutdownChan:
		fmt.Println("\nSinyal shutdown sistem terdeteksi! Membatalkan konteks...")
		cancel()
	case <-waitForCompletion(&workerWg):
		fmt.Println("\nSeluruh pekerja telah menyelesaikan tugas di antrean.")
	}

	// Tutup antrean hasil setelah pekerja selesai
	workerWg.Wait()
	close(results)
	resultWg.Wait()

	fmt.Println("Aplikasi backend Go dimatikan secara bersih (graceful).")
}

func waitForCompletion(wg *sync.WaitGroup) <-chan struct{} {
	ch := make(chan struct{})
	go func() {
		wg.Wait()
		close(ch)
	}()
	return ch
}
```

---

## 3. Analisis Kunci Keamanan & Performa

### 1. Kapasitas Channel (Backpressure)
Dengan mendeklarasikan antrean berkapasitas tertentu (`make(chan Job, 100)`), Anda menerapkan prinsip **Backpressure**. Jika antrean penuh karena pekerja lambat, produsen akan tertahan (*block*) alih-alih terus menumpuk jutaan objek di memori heap RAM.

### 2. Mencegah Goroutine Leak
Pola `select` dengan saluran pembatalan konteks (`case <-ctx.Done():`) menjamin tidak ada goroutine pekerja yang tertinggal dalam status menggantung (*zombie goroutine*) saat server menerima sinyal restart dari Kubernetes atau Docker.

### 3. Eksekusi Hasil yang Tidak Memblokir Pekerja
Saluran `results` diproses oleh goroutine terpisah. Dengan demikian, pekerja nomor 1 tidak perlu menunggu operasi penulisan log atau I/O jaringan selesai sebelum mengambil tugas berikutnya dari antrean utama.

---

## 4. Benchmark dan Pengujian Beban

Jalankan program di terminal:

```bash
go run main.go
```

Perhatikan bahwa meskipun terdapat 30 tugas berat, hanya **5 goroutine pekerja** yang aktif secara simultan. Lonjakan beban trafik tidak lagi mampu menaikkan footprint memori secara linier, menjaga kestabilan API backend Anda pada level performa optimal.

---

## Kesimpulan

Membatasi konkurensi melalui worker pool adalah pembeda antara kode Go amatir dan sistem backend level produksi (*production-grade*). Dengan arsitektur ini, server Anda dapat bertahan dari gempuran trafik ekstrem tanpa mengalami degradasi layanan atau kebocoran memori.
