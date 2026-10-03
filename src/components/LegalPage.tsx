import React, { useState } from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface LegalPageProps {
  initialTab?: 'terms' | 'privacy';
  onBackToHome: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  initialTab = 'terms',
  onBackToHome,
  darkMode,
  toggleDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-obsidian-950/95 backdrop-blur-md border-b border-slate-200 dark:border-obsidian-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-3 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-obsidian-950 font-mono font-bold flex items-center justify-center text-sm">
              WA
            </div>
            <span>Kembali ke Beranda</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-slate-300 dark:border-obsidian-700 bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {darkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <button type="button" onClick={onBackToHome} className="hover:underline">Beranda</button>
          <span>/</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Dokumen Legal &amp; Kepatuhan</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-obsidian-800 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`min-h-[44px] pb-3 text-base sm:text-lg font-bold border-b-2 transition-colors ${
              activeTab === 'terms'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Syarat &amp; Ketentuan Layanan (TOS)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`min-h-[44px] pb-3 text-base sm:text-lg font-bold border-b-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Kebijakan Privasi
          </button>
        </div>

        {/* Tab 1: Terms of Service */}
        {activeTab === 'terms' && (
          <article className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            <div className="space-y-2 border-b border-slate-200 dark:border-obsidian-800 pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Syarat &amp; Ketentuan Layanan (Terms of Service)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Terakhir diperbarui: 3 Oktober 2026 | Domain Resmi: wahidalimudin.web.id
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                1. Pengenalan dan Penerimaan Ketentuan
              </h2>
              <p>
                Selamat datang di situs profil profesional Wahid Alimudin (wahidalimudin.web.id). Dengan mengakses situs ini atau menggunakan layanan konsultasi pembuatan software house, pengembangan robot trading Expert Advisor (MQL5 MT5), dan perangkat IoT, Anda menyatakan telah membaca, memahami, serta menyetujui syarat dan ketentuan berikut.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Ruang Lingkup Layanan
              </h2>
              <p>
                Layanan profesional yang disediakan meliputi:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Pengembangan Software House:</strong> Pembuatan aplikasi web, integrasi API, sistem informasi manajemen, dan portal akademik (seperti SIAKAD Ponpes, PSB Online).</li>
                <li><strong>Pengembangan Robot Trading MQL5 (MT5):</strong> Pemrograman algoritma Expert Advisor kustom berdasarkan aturan strategi yang ditentukan oleh klien.</li>
                <li><strong>Sistem IoT &amp; Embedded:</strong> Pemrograman mikrokontroler ESP32, integrasi sensor RFID, dan arsitektur data real time.</li>
                <li><strong>Kurasi Afiliasi:</strong> Rekomendasi perangkat keras, alat setup coding, dan infrastruktur server VPS terkurasi melalui program resmi Shopee dan TikTok Affiliate.</li>
              </ul>
            </section>

            <section className="space-y-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
              <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">
                3. Penafian Risiko Khusus Robot Trading (Financial Risk Disclaimer)
              </h2>
              <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                Trading instrumen finansial seperti forex, komoditas emas (XAUUSD), indeks, dan aset derivatif mengandung tingkat risiko tinggi terhadap modal Anda. Pengembangan Expert Advisor (EA) MQL5 bertujuan untuk mengotomatiskan eksekusi strategi berdasarkan logika teknis yang disepakati. Hasil simulasi Strategy Tester historis (backtesting) tidak menjamin keuntungan pada masa depan. Wahid Alimudin bertindak sebagai pengembang teknis (software programmer) dan bukan penasihat keuangan berlisensi. Klien bertanggung jawab penuh atas segala keputusan modal, pengelolaan lot, dan hasil perdagangan pada akun broker masing-masing.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                4. Hak Kekayaan Intelektual dan Kerahasiaan Strategi
              </h2>
              <p>
                Segala logika trading, parameter rahasia, atau aturan bisnis unik yang Anda bagikan selama masa konsultasi dijaga kerahasiaannya dan tidak akan dipublikasikan atau dijual kepada pihak ketiga tanpa izin tertulis dari Anda. Penyerahan file source code (.mq5 / kode sumber web) mengikuti perjanjian kerja sama masing-masing proyek.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                5. Keterbukaan Tautan Pihak Ketiga &amp; Afiliasi
              </h2>
              <p>
                Situs ini memuat tautan ke toko e-commerce resmi (Shopee, TikTok) dan mitra infrastruktur server. Transaksi pembelian barang fisik atau layanan pihak ketiga tunduk pada syarat dan ketentuan masing-masing platform penyedia.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                6. Kontak Layanan
              </h2>
              <p>
                Pertanyaan terkait syarat dan ketentuan ini dapat diajukan langsung melalui WhatsApp resmi <strong>+62 815-4098-3390</strong> atau melalui Telegram <strong>@wahidalimudin</strong>.
              </p>
            </section>
          </article>
        )}

        {/* Tab 2: Privacy Policy */}
        {activeTab === 'privacy' && (
          <article className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            <div className="space-y-2 border-b border-slate-200 dark:border-obsidian-800 pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Kebijakan Privasi (Privacy Policy)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Terakhir diperbarui: 3 Oktober 2026 | Domain Resmi: wahidalimudin.web.id
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                1. Komitmen Perlindungan Data Pribadi
              </h2>
              <p>
                Privasi pengunjung situs wahidalimudin.web.id merupakan prioritas mendasar. Kebijakan privasi ini menjelaskan secara transparan bagaimana data yang Anda kirimkan dikelola dan dilindungi saat berinteraksi dengan layanan kami.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Informasi yang Kami Kumpulkan
              </h2>
              <p>
                Situs ini dirancang untuk meminimalkan pengumpulan data pribadi. Kami hanya memproses informasi berikut:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Informasi Komunikasi Sukarela:</strong> Nama, nomor telepon/WhatsApp, dan rincian ringkasan kebutuhan proyek yang Anda isi pada formulir konsultasi untuk dikirimkan melalui aplikasi WhatsApp.</li>
                <li><strong>Data Preferensi Tampilan Lokal:</strong> Pilihan preferensi tema tampilan (Dark Mode atau Light Mode) yang disimpan secara lokal pada peramban (localStorage) perangkat Anda tanpa dikirimkan ke server kami.</li>
                <li><strong>Log Server Standar:</strong> Penyedia hosting Cloudflare mengumpulkan log teknis anonim standar seperti alamat IP, jenis peramban, dan waktu akses untuk keperluan keamanan jaringan dan pencegahan serangan DDoS.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Tujuan Penggunaan Informasi
              </h2>
              <p>
                Data yang Anda sampaikan kepada kami hanya digunakan untuk:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Merespon pertanyaan dan kebutuhan konsultasi teknis yang Anda ajukan.</li>
                <li>Menyusun penawaran rencana kerja, estimasi waktu, dan rincian spesifikasi sistem software/MQL5.</li>
                <li>Mendukung proses komunikasi pengerjaan proyek aktif Anda.</li>
              </ul>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                Kami tidak pernah menjual, menyewakan, atau mendistribusikan data kontak pribadi Anda kepada pihak ketiga untuk kepentingan periklanan atau spam.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                4. Penyimpanan dan Keamanan Data
              </h2>
              <p>
                Komunikasi pesan langsung melalui WhatsApp dilindungi oleh enkripsi ujung-ke-ujung (end-to-end encryption) milik protokol WhatsApp. Kami menerapkan praktik keamanan standar pada seluruh repositori kode dan server hosting Cloudflare Pages berprotokol HTTPS/SSL.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                5. Tautan ke Situs Eksternal
              </h2>
              <p>
                Situs ini memuat tautan menuju situs platform SaaS (siakadponpes.com, psbonline.id, wanotif.web.id, presensirfid.web.id, smartapps.my.id) serta tautan afiliasi Shopee dan TikTok. Ketika Anda mengeklik tautan tersebut, Anda berpindah ke domain pihak ketiga yang memiliki kebijakan privasi masing-masing di luar kendali kami.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                6. Hak Anda atas Data Pribadi
              </h2>
              <p>
                Anda berhak meminta klarifikasi, pembaruan, atau penghapusan riwayat percakapan konsultasi proyek Anda dari kontak kami kapan saja dengan menghubungi kami melalui WhatsApp <strong>+62 815-4098-3390</strong>.
              </p>
            </section>
          </article>
        )}

        {/* Back Button Action */}
        <div className="pt-8 border-t border-slate-200 dark:border-obsidian-800 flex justify-between items-center">
          <button
            type="button"
            onClick={onBackToHome}
            className="min-h-[44px] px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            &larr; Kembali ke Halaman Utama
          </button>
          <div className="text-xs text-slate-500 font-mono">
            wahidalimudin.web.id
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 dark:border-obsidian-800 py-6 text-center text-xs text-slate-500">
        &copy; 2026 Wahid Alimudin. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
};
