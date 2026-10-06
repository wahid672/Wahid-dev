// Layanan Contextual Auto-Linking untuk Konten Blog Wahid Dev
// Menyediakan kamus kata kunci berbobot tinggi untuk auto-linking internal artikel blog

export interface KeywordLinkItem {
  keyword: string;
  slug: string;
}

export interface AutoLinkState {
  currentSlug?: string;
  linkedSlugs: Set<string>;
  totalLinksCount: number;
  maxLinks: number;
}

// Kamus kata kunci kontekstual yang dipetakan ke slug artikel canonical
// Diurutkan berdasarkan panjang kata (descending) agar frasa majemuk dicocokkan terlebih dahulu
export const RAW_KEYWORD_LINKS: KeywordLinkItem[] = [
  // MetaTrader 5 & Algorithmic Trading
  { keyword: 'Strategy Tester', slug: 'optimasi-backtest-strategy-tester-metatrader-5' },
  { keyword: 'Trailing Stop', slug: 'cara-menggunakan-trailing-stop-mql5-metatrader-5' },
  { keyword: 'MetaTrader 5', slug: 'panduan-membuat-expert-advisor-mql5-metatrader-5' },
  { keyword: 'Expert Advisor', slug: 'panduan-membuat-expert-advisor-mql5-metatrader-5' },
  { keyword: 'Algo Trading', slug: 'tren-algo-trading-ai-kuantitatif-metatrader-2026' },
  { keyword: 'VPS MT5', slug: 'setup-vps-linux-headless-metatrader-5-wine' },
  { keyword: 'MQL5', slug: 'panduan-membuat-expert-advisor-mql5-metatrader-5' },

  // IoT & Embedded Systems
  { keyword: 'Predictive Maintenance', slug: 'proyek-esp32-predictive-maintenance-getaran-motor-mesin' },
  { keyword: 'Monitoring Energi Listrik', slug: 'proyek-esp32-monitoring-energi-listrik-pzem004t' },
  { keyword: 'Smart Energy Monitor', slug: 'proyek-esp32-monitoring-energi-listrik-pzem004t' },
  { keyword: 'Presensi RFID ESP32', slug: 'proyek-esp32-presensi-rfid-offline-buffer-webhook-wa' },
  { keyword: 'Deteksi Kebocoran Gas', slug: 'proyek-esp32-deteksi-kebocoran-gas-lpg-solenoid-telegram' },
  { keyword: 'Irigasi Cerdas ESP32', slug: 'proyek-esp32-irigasi-cerdas-prediktif-weather-api' },
  { keyword: 'ESP32-CAM Edge AI', slug: 'proyek-esp32-cam-edge-ai-vision-deteksi-tamu-tanpa-cloud' },
  { keyword: 'Deteksi Jatuh Lansia', slug: 'proyek-esp32-deteksi-jatuh-lansia-emergency-sos' },
  { keyword: 'Smart Cold Chain', slug: 'proyek-esp32-cold-chain-monitoring-suhu-lora' },
  { keyword: 'Otomasi Toren Air', slug: 'proyek-esp32-monitoring-toren-air-proteksi-pompa-anti-dry-run' },
  { keyword: 'RFID RC522', slug: 'perbedaan-sensor-rfid-rc522-dan-pn532-nfc' },
  { keyword: 'Deep Sleep', slug: 'tutorial-esp32-deep-sleep-manajemen-daya-baterai' },
  { keyword: 'ESP-NOW Mesh', slug: 'proyek-esp32-jaringan-sensor-tanpa-internet-esp-now-mesh' },
  { keyword: 'LoRa SX1278', slug: 'proyek-esp32-cold-chain-monitoring-suhu-lora' },
  { keyword: 'PZEM-004T', slug: 'proyek-esp32-monitoring-energi-listrik-pzem004t' },
  { keyword: 'JSN-SR04T', slug: 'proyek-esp32-monitoring-toren-air-proteksi-pompa-anti-dry-run' },
  { keyword: 'RISC-V', slug: 'arsitektur-risc-v-pada-mikrokontroler-iot-modern' },
  { keyword: 'PN532', slug: 'perbedaan-sensor-rfid-rc522-dan-pn532-nfc' },
  { keyword: 'RC522', slug: 'perbedaan-sensor-rfid-rc522-dan-pn532-nfc' },
  { keyword: 'ESP32', slug: 'integrasi-esp32-rfid-rc522-dashboard-web' },
  { keyword: 'Broker MQTT', slug: 'panduan-lengkap-mqtt-instalasi-broker-docker-vps-esp32' },
  { keyword: 'Mosquitto', slug: 'panduan-lengkap-mqtt-instalasi-broker-docker-vps-esp32' },
  { keyword: 'QoS', slug: 'panduan-lengkap-mqtt-instalasi-broker-docker-vps-esp32' },
  { keyword: 'MQTT', slug: 'komunikasi-mqtt-esp32-broker-cloud-iot' },

  // Web Engineering, Cloud & Database
  { keyword: 'Cloudflare Workers', slug: 'tutorial-serverless-api-cloudflare-workers-d1' },
  { keyword: 'WhatsApp Gateway', slug: 'otomasi-notifikasi-whatsapp-gateway-node-js' },
  { keyword: 'Redis Streams', slug: 'tutorial-redis-streams-event-driven-architecture' },
  { keyword: 'Multi-Tenant', slug: 'arsitektur-multi-tenant-siakad-pondok-pesantren' },
  { keyword: 'Web Analytics', slug: 'cara-memasang-hitpulse-web-analytics-realtime-gratis' },
  { keyword: 'Worker Pool', slug: 'tutorial-golang-worker-pool-concurrency-api' },
  { keyword: 'Git Rebase', slug: 'tutorial-git-interactive-rebase-dan-bisect' },
  { keyword: 'Dockerfile', slug: 'tutorial-optimasi-dockerfile-multi-stage-build' },
  { keyword: 'GHCR', slug: 'cara-membuat-editor-video-online-remotion-ai-docker-ghcr' },
  { keyword: 'PSB Online', slug: 'arsitektur-psb-online-verifikasi-berkas-dan-pembayaran' },
  { keyword: 'PostgreSQL', slug: 'optimasi-query-postgresql-indexing-aplikasi-akademik' },
  { keyword: 'HitPulse', slug: 'cara-memasang-hitpulse-web-analytics-realtime-gratis' },
  { keyword: 'pgvector', slug: 'tutorial-rag-postgresql-pgvector-semantic-search' },
  { keyword: 'Zustand', slug: 'manajemen-state-react-tanpa-redux-dengan-zustand' },
  { keyword: 'Golang', slug: 'tutorial-golang-worker-pool-concurrency-api' },
  { keyword: 'SIAKAD', slug: 'arsitektur-multi-tenant-siakad-pondok-pesantren' },

  // Artificial Intelligence & Next-Gen
  { keyword: 'Model Context Protocol', slug: 'standar-model-context-protocol-mcp-integrasi-ai' },
  { keyword: 'Antigravity CLI', slug: 'cara-instal-antigravity-cli-termux-android-ai' },
  { keyword: 'Agentic AI', slug: 'kebangkitan-agentic-ai-dan-otonom-workflow-2026' },
  { keyword: 'Zero Trust', slug: 'arsitektur-zero-trust-keamanan-siber-proaktif-2026' },
  { keyword: 'MCP Server', slug: 'tutorial-membangun-mcp-server-typescript-ai-agent' },
  { keyword: 'ElevenLabs', slug: 'tutorial-voiceover-ai-emosional-elevenlabs-video-iklan' },
  { keyword: 'Google Flow', slug: 'cara-membuat-video-iklan-shopee-affiliate-dengan-google-flow-ai' },
  { keyword: 'Kling AI', slug: 'cara-membuat-video-iklan-produk-sinematik-kling-ai-dan-luma' },
  { keyword: 'Ollama', slug: 'tutorial-setup-ollama-local-llm-coding-offline' },
  { keyword: 'Termux', slug: 'cara-instal-antigravity-cli-termux-android-ai' },

  // Rekayasa Perangkat Lunak & Vibe Coding
  { keyword: 'Vibe Coding', slug: 'bahaya-keamanan-dan-celah-idor-aplikasi-vibe-coding' },
  { keyword: 'Celah IDOR', slug: 'bahaya-keamanan-dan-celah-idor-aplikasi-vibe-coding' },
  { keyword: 'N+1 Query', slug: 'masalah-n-plus-1-dan-ketiadaan-indeks-database-vibe-coder' },
  { keyword: 'Indeks Database', slug: 'masalah-n-plus-1-dan-ketiadaan-indeks-database-vibe-coder' },
  { keyword: 'Memory Leak', slug: 'bom-waktu-memory-leak-dan-re-render-react-vibe-coder' },
  { keyword: 'Happy Path', slug: 'sindrom-happy-path-dan-ketiadaan-resiliensi-error-vibe-coding' },
  { keyword: 'Rate Limiting', slug: 'ancaman-tagihan-bengkak-api-dan-ketiadaan-rate-limiting-vibe-coder' },
  { keyword: 'Zombie Code', slug: 'zombie-code-dan-ketergantungan-paket-liar-aplikasi-vibe-coding' },
  { keyword: 'Arsitektur Caching', slug: 'kejutan-tagihan-cloud-dan-ketiadaan-arsitektur-caching-vibe-coder' },
  { keyword: 'Structured Logging', slug: 'kebutaan-observabilitas-dan-ketiadaan-logging-terstruktur-vibe-coder' },
  { keyword: 'Privasi PII', slug: 'kebocoran-data-pii-dan-sesi-autentikasi-rapuh-vibe-coding' },
  { keyword: 'Automated Testing', slug: 'ketiadaan-automated-testing-dan-regresi-fitur-vibe-coder' },

  // Video Iklan, Creator & Affiliate
  { keyword: 'Shopee Affiliate', slug: 'trik-bikin-video-iklan-shopee-affiliate-otomatis-dari-link-produk' },
  { keyword: 'Shopee Video', slug: 'strategi-shopee-video-fyp-algoritma-komisi-ratusan-juta' },
  { keyword: 'Komisi XTRA', slug: 'cara-maksimalkan-komisi-xtra-shopee-affiliate-hingga-20-persen' },
  { keyword: 'Shopee Live', slug: 'trik-shopee-live-konversi-tinggi-affiliate-omzet-ratusan-juta' },
  { keyword: 'Multi-Channel Funnel', slug: 'strategi-multi-channel-funnel-tiktok-instagram-ke-shopee-affiliate' },
  { keyword: 'Racun Shopee', slug: 'cara-membangun-komunitas-telegram-dan-whatsapp-racun-shopee-cuan' },
  { keyword: 'Sampel Gratis Shopee', slug: 'rahasia-mendapatkan-sampel-gratis-dan-direct-deal-seller-shopee' },
  { keyword: 'Direct Deal', slug: 'rahasia-mendapatkan-sampel-gratis-dan-direct-deal-seller-shopee' },
  { keyword: 'Produk Winning Shopee', slug: 'cara-riset-produk-winning-shopee-affiliate-tren-dan-margin-tinggi' },
  { keyword: 'Banned Shopee Affiliate', slug: 'panduan-aman-shopee-affiliate-bebas-banned-dan-pelanggaran-hak-cipta' },
  { keyword: 'Scale Up Affiliate', slug: 'strategi-scale-up-shopee-affiliate-bangun-tim-dan-otomasi-konten' },
  { keyword: 'Pajak Shopee Affiliate', slug: 'manajemen-keuangan-dan-pajak-shopee-affiliate-pph-21-dan-cashflow' },
  { keyword: 'TikTok Affiliate', slug: 'panduan-membuat-video-iklan-ai-ugc-tiktok-affiliate-cuan' },
  { keyword: 'Faceless Channel', slug: 'rahasia-video-iklan-faceless-channel-monetisasi-global' },
  { keyword: 'Video Iklan AI', slug: 'panduan-membuat-video-iklan-ai-ugc-tiktok-affiliate-cuan' },
  { keyword: 'Editor Video Remotion', slug: 'cara-membuat-editor-video-online-remotion-ai-docker-ghcr' },
  { keyword: 'Remotion', slug: 'tutorial-lengkap-remotion-video-editing-react-pemula-a-sampai-z' },
  { keyword: 'Renotion', slug: 'tutorial-lengkap-remotion-video-editing-react-pemula-a-sampai-z' },
  { keyword: 'CapCut', slug: 'cara-menghasilkan-uang-dari-hp-kreator-template-capcut' },
  { keyword: 'Canva', slug: 'cara-jual-template-canva-produk-digital-lewat-hp' },

  // Niche & Riset Pasar
  { keyword: 'Google Trends', slug: 'cara-riset-tren-niche-google-trends-dan-glimpse' },
  { keyword: 'Micro Niche', slug: 'perbedaan-micro-niche-dan-broad-niche-strategi-skala' },
  { keyword: 'Niche Pasar', slug: 'apa-itu-niche-pasar-dan-mengapa-penting-untuk-bisnis-digital' },

  // Kerja Remote & Monetisasi
  { keyword: 'PlaytestCloud', slug: 'panduan-menjadi-penguji-game-seluler-playtestcloud-dibayar-dolar' },
  { keyword: 'Roblox DevEx', slug: 'panduan-roblox-devex-menghasilkan-uang-riil-dari-game' },
  { keyword: 'Steam Market', slug: 'cara-menghasilkan-saldo-dari-pasar-komunitas-resmi-steam' },
  { keyword: 'Shutterstock', slug: 'cara-menjual-foto-dan-video-kamera-hp-ke-shutterstock' },
  { keyword: 'Resume ATS', slug: 'rahasia-resume-cv-ats-standar-global-lolos-remote-dolar' },
  { keyword: 'Interview Kerja Remote', slug: 'trik-lolos-interview-bahasa-inggris-kerja-remote-pemula' },
  { keyword: 'Negosiasi Gaji', slug: 'cara-menjawab-ekspektasi-gaji-dolar-dan-trik-negosiasi' },
  { keyword: 'Take-Home Assignment', slug: 'panduan-lolos-take-home-assignment-dan-live-coding-remote' },
  { keyword: 'Live Coding', slug: 'panduan-lolos-take-home-assignment-dan-live-coding-remote' },
  { keyword: 'Cold Email', slug: 'trik-cold-email-dan-dm-pitching-klien-remote-luar-negeri' },
  { keyword: 'Portofolio Global', slug: 'cara-membangun-portofolio-standar-internasional-klien-dolar' },
  { keyword: 'Scam Kerja Remote', slug: 'ciri-ciri-lowongan-kerja-remote-palsu-dan-cara-menghindarinya' },
  { keyword: 'Platform Kurasi', slug: 'platform-kurasi-kerja-remote-tanpa-persaingan-banting-harga' },
  { keyword: 'Setup Kerja Remote', slug: 'persiapan-hardware-dan-ergonomi-kerja-remote-standar-global' },
  { keyword: 'Transisi Karir Remote', slug: 'strategi-transisi-dari-pekerja-kantoran-lokal-ke-remote-dolar' },
  { keyword: 'Kerja Remote', slug: 'platform-kerja-remote-luar-negeri-terbaik-gaji-dolar' },
  { keyword: 'Gaji Dolar', slug: 'cara-menerima-gaji-dolar-rekening-bank-indonesia-wise-payoneer' },
  { keyword: 'Mistplay', slug: 'cara-kerja-mistplay-dan-ekosistem-reward-game-android' },
  { keyword: 'LinkedIn', slug: 'cara-optimasi-profil-linkedin-recruiter-asing-klien-dolar' },
  { keyword: 'Wise', slug: 'cara-menerima-gaji-dolar-rekening-bank-indonesia-wise-payoneer' },

  // Aplikasi Android Penghasil Uang & Reward Legit
  { keyword: 'Google Opinion Rewards', slug: 'panduan-google-opinion-rewards-penghasil-saldo-resmi-google' },
  { keyword: 'Rakuten Insight', slug: 'trik-cuan-survei-rakuten-insight-cairkan-saldo-dana-gopay' },
  { keyword: 'Premise Data', slug: 'panduan-premise-data-aplikasi-tugas-lapangan-dibayar-rupiah' },
  { keyword: 'AttaPoll', slug: 'cara-menghasilkan-uang-dari-attapoll-survei-global-payout-rendah' },
  { keyword: 'Snapcart', slug: 'trik-snapcart-ubah-struk-belanja-supermarket-jadi-uang-tunai' },
  { keyword: 'Toloka', slug: 'panduan-toloka-yandex-microtask-anotasi-data-ai-dibayar-dolar' },
  { keyword: 'Foap', slug: 'cara-jual-foto-kamera-hp-di-foap-dan-menghasilkan-dolar-nyata' },
  { keyword: 'YouGov', slug: 'panduan-yougov-indonesia-survei-opini-publik-tukar-saldo-tunai' },
  { keyword: 'Sweatcoin', slug: 'cara-kerja-sweatcoin-dan-macadam-aplikasi-jalan-kaki-penghasil-reward' },
  { keyword: 'Macadam', slug: 'cara-kerja-sweatcoin-dan-macadam-aplikasi-jalan-kaki-penghasil-reward' },
  { keyword: 'Aplikasi Penghasil Uang Scam', slug: 'ciri-ciri-aplikasi-penghasil-uang-scam-dan-cara-menghindarinya' },

  // Rekomendasi Laptop & Hardware Kuliah
  { keyword: 'Laptop Gaming Under 10 Juta', slug: 'laptop-gaming-under-10-juta-untuk-kuliah' },
  { keyword: 'Laptop Kuliah Under 10 Juta', slug: 'rekomendasi-laptop-terbaik-untuk-kuliah-under-10-juta' },
  { keyword: 'Laptop Coding Mahasiswa', slug: 'laptop-coding-mahasiswa-teknik-informatika-under-10-juta' },
  { keyword: 'Laptop Tipis dan Ringan', slug: 'laptop-kuliah-tipis-ringan-baterai-awet-under-10-juta' },
  { keyword: 'Laptop Desain Grafis', slug: 'laptop-desain-grafis-dkv-mahasiswa-under-10-juta' },
  { keyword: 'Laptop Kuliah 5 Jutaan', slug: 'rekomendasi-laptop-kuliah-harga-5-jutaan-terbaik' },
  { keyword: 'Laptop Kuliah 7 Jutaan', slug: 'rekomendasi-laptop-kuliah-7-jutaan-paling-worth-it' },
  { keyword: 'Spek Laptop Mahasiswa', slug: 'panduan-spesifikasi-laptop-mahasiswa-awet-sampai-lulus' },
  { keyword: 'Laptop Brand Lokal', slug: 'laptop-brand-lokal-vs-global-under-10-juta-mahasiswa' },
  { keyword: 'Beli Laptop Kuliah', slug: 'tips-beli-laptop-kuliah-under-10-juta-bebas-zonk' }
];

export const KEYWORD_LINKS: KeywordLinkItem[] = [...RAW_KEYWORD_LINKS].sort(
  (a, b) => b.keyword.length - a.keyword.length
);

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createAutoLinkState(currentSlug?: string, maxLinks = 3): AutoLinkState {
  return {
    currentSlug,
    linkedSlugs: new Set<string>(),
    totalLinksCount: 0,
    maxLinks
  };
}

export type AutoLinkNode = string | { keyword: string; slug: string };

/**
 * Mencoba melakukan auto-link pada teks polos jika aturan batas masih terpenuhi.
 * Hanya menautkan maksimal 1 kata kunci per panggilan (1 per paragraf).
 */
export function tryAutoLinkPlainText(
  text: string,
  state: AutoLinkState
): { hasLinked: boolean; nodes: AutoLinkNode[] } {
  if (state.totalLinksCount >= state.maxLinks || !text || text.length < 4) {
    return { hasLinked: false, nodes: [text] };
  }

  for (const item of KEYWORD_LINKS) {
    // Hindari link ke artikel yang sedang dibaca dan hindari duplikasi link ke slug yang sama
    if (item.slug === state.currentSlug || state.linkedSlugs.has(item.slug)) {
      continue;
    }

    const regex = new RegExp(`\\b(${escapeRegExp(item.keyword)})\\b`, 'i');
    const match = text.match(regex);

    if (match && match.index !== undefined) {
      const before = text.substring(0, match.index);
      const matched = match[0];
      const after = text.substring(match.index + matched.length);

      state.linkedSlugs.add(item.slug);
      state.totalLinksCount++;

      return {
        hasLinked: true,
        nodes: [before, { keyword: matched, slug: item.slug }, after]
      };
    }
  }

  return { hasLinked: false, nodes: [text] };
}
