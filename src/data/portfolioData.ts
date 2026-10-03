import { ProductItem, Mql5Feature, TechItem, AffiliateItem } from '../types';

export const FOUNDED_PRODUCTS: ProductItem[] = [
  {
    id: 'siakadponpes',
    name: 'SIAKAD Ponpes',
    domain: 'siakadponpes.com',
    url: 'https://siakadponpes.com',
    category: 'academic',
    categoryLabel: 'SaaS Akademik',
    description: 'Sistem Informasi Akademik terintegrasi untuk pengelolaan pondok pesantren, manajemen santri, kurikulum, penilaian, dan administrasi keuangan digital.',
    techStack: ['PHP', 'MySQL', 'React', 'REST API'],
    status: 'Production Live'
  },
  {
    id: 'psbonline',
    name: 'PSB Online',
    domain: 'psbonline.id',
    url: 'https://psbonline.id',
    category: 'academic',
    categoryLabel: 'SaaS Akademik',
    description: 'Platform Penerimaan Santri dan Siswa Baru online dengan alur pendaftaran mandiri, verifikasi berkas digital, dan integrasi pembayaran.',
    techStack: ['PHP', 'Node.js', 'Webhooks', 'Tailwind'],
    status: 'Production Live'
  },
  {
    id: 'wanotif',
    name: 'WA Notif Gateway',
    domain: 'wanotif.web.id',
    url: 'https://wanotif.web.id',
    category: 'automation',
    categoryLabel: 'Automasi & Notifikasi',
    description: 'Mesin gateway pesan WhatsApp otomatis untuk notifikasi tagihan, OTP verifikasi, pengingat jadwal, dan broadcast sistem terenkripsi.',
    techStack: ['Node.js', 'Golang', 'Socket.IO', 'Redis'],
    status: 'Active SaaS'
  },
  {
    id: 'presensirfid',
    name: 'Presensi RFID IoT',
    domain: 'presensirfid.web.id',
    url: 'https://presensirfid.web.id',
    category: 'iot',
    categoryLabel: 'Hardware & IoT',
    description: 'Sistem presensi kehadiran real time berbasis mikrokontroler ESP32 dan kartu RFID, terhubung langsung ke dashboard web dan notifikasi WhatsApp.',
    techStack: ['ESP32', 'C++', 'RFID RC522', 'PHP Backend'],
    status: 'Production Live'
  },
  {
    id: 'smartapps',
    name: 'SmartApps Solutions',
    domain: 'smartapps.my.id',
    url: 'https://smartapps.my.id',
    category: 'business',
    categoryLabel: 'Digital Apps',
    description: 'Layanan software house dan solusi aplikasi custom untuk transformasi digital lembaga, yayasan, dan UMKM.',
    techStack: ['Fullstack Web', 'Golang', 'React', 'Mobile Ready'],
    status: 'Active SaaS'
  }
];

export const MQL5_SERVICES: Mql5Feature[] = [
  {
    id: 'custom-ea',
    title: 'Pengembangan Custom Expert Advisor (MT5)',
    tag: 'MQL5 Architecture',
    description: 'Penerjemahan strategi trading manual Anda ke dalam robot trading otomatis (EA) dengan logika eksekusi presisi pada MetaTrader 5.',
    details: [
      'Implementasi indikator kustom dan multi-timeframe',
      'Filter spread, slippage protection, dan news event filter',
      'Eksekusi market order, pending order, dan split position'
    ]
  },
  {
    id: 'risk-management',
    title: 'Sistem Manajemen Risiko & Trailing Stop',
    tag: 'Capital Protection',
    description: 'Modul kalkulasi lot dinamis berdasarkan persentase modal, equity stop loss, break even otomatis, dan trailing stop adaptif.',
    details: [
      'Kalkulasi risiko per transaksi (misal: 1% risk per trade)',
      'Trailing stop berbasis ATR (Average True Range) atau High/Low',
      'Pengunci profit bertingkat (Step Break-Even)'
    ]
  },
  {
    id: 'backtest-audit',
    title: 'Optimasi & Stress-Testing Algoritma',
    tag: 'Strategy Tester',
    description: 'Pengujian ketahanan algoritma pada Strategy Tester MT5 dengan model tick real (Every tick based on real ticks) dan pemodelan latensi.',
    details: [
      'Simulasi data historis akurasi 99% pada MetaTrader 5',
      'Analisis rasio Sharpe, Maximum Drawdown, dan Profit Factor',
      'Optimasi parameter tanpa curve-fitting berlebihan'
    ]
  },
  {
    id: 'automation-bridge',
    title: 'Integrasi Webhook & Web Service ke MT5',
    tag: 'Bridge & API',
    description: 'Jembatan komunikasi data antara sinyal web, bot Telegram, atau backend API ke terminal MT5 untuk eksekusi sinyal trading otomatis.',
    details: [
      'Socket server / HTTP request via modul network MQL5',
      'Pemberitahuan eksekusi posisi ke akun Telegram pribadi',
      'Sinkronisasi status balance dan floating profit ke web dashboard'
    ]
  }
];

export const TECH_ITEMS: TechItem[] = [
  { name: 'MQL5 / MetaTrader 5', level: 'Spesialis Algo Trading', category: 'Trading & Algo', icon: 'Terminal' },
  { name: 'Golang', level: 'High Concurrency & Microservices', category: 'Backend', icon: 'Server' },
  { name: 'Node.js / Express', level: 'API Engine & Webhooks', category: 'Backend', icon: 'Cpu' },
  { name: 'PHP / Laravel', level: 'Enterprise Web & SaaS Core', category: 'Backend', icon: 'Database' },
  { name: 'React & TypeScript', level: 'Modern Frontend & Dashboard', category: 'Frontend', icon: 'Code' },
  { name: 'Tailwind CSS', level: 'Responsive UI Architecture', category: 'Frontend', icon: 'Layout' },
  { name: 'ESP32 & C/C++', level: 'Embedded IoT & Firmware', category: 'IoT & Hardware', icon: 'Radio' },
  { name: 'RFID Hardware', level: 'Identity Systems & Sensors', category: 'IoT & Hardware', icon: 'Scan' }
];

export const AFFILIATE_ITEMS: AffiliateItem[] = [
  {
    id: 'esp32-devkit',
    title: 'ESP32 DevKit V1 30-Pin / 38-Pin Microcontroller',
    platform: 'Shopee Affiliate',
    category: 'IoT & Microcontroller',
    description: 'Modul mikrokontroler utama yang saya gunakan dalam pembuatan sistem Presensi RFID dan perangkat automasi IoT cerdas.',
    specs: ['Dual-Core 240MHz', 'Built-in Wi-Fi & Bluetooth', '30 GPIO Pin support'],
    linkUrl: 'https://shopee.co.id'
  },
  {
    id: 'rc522-rfid-kit',
    title: 'RC522 RFID Reader/Writer + Kartu Mifare 13.56MHz',
    platform: 'Shopee Affiliate',
    category: 'IoT & Microcontroller',
    description: 'Modul sensor pembaca kartu RFID handal dengan respon cepat untuk kebutuhan absensi santri, siswa, maupun akses gerbang.',
    specs: ['Frekuensi 13.56 MHz', 'Protokol SPI', 'Termasuk Tag Gantungan & Kartu'],
    linkUrl: 'https://shopee.co.id'
  },
  {
    id: 'monitor-arm-dual',
    title: 'Heavy Duty Dual Monitor Arm Gas Spring',
    platform: 'TikTok Affiliate',
    category: 'Workstation Gear',
    description: 'Bracket monitor ganda ergonomis untuk setup coding fullstack sekaligus memantau multi-chart MetaTrader 5 secara real time.',
    specs: ['Mendukung monitor 17 - 32 inch', 'VESA 75x75 & 100x100', 'Full Cable Management'],
    linkUrl: 'https://tiktok.com'
  },
  {
    id: 'mechanical-keyboard',
    title: 'Custom Compact Mechanical Keyboard (Hot-swappable)',
    platform: 'TikTok Affiliate',
    category: 'Workstation Gear',
    description: 'Keyboard mekanik ergonomis dengan switch responsif untuk kenyamanan mengetik ribuan baris kode MQL5, React, dan Golang.',
    specs: ['Koneksi Tri-Mode Wireless & Type-C', 'PBT Keycaps Awet', 'Linear / Tactile Switch'],
    linkUrl: 'https://tiktok.com'
  },
  {
    id: 'vps-forex',
    title: 'VPS Forex Ultra Low Latency untuk MT5 24/7',
    platform: 'VPS Partner',
    category: 'Trading Infrastructure',
    description: 'Server virtual private khusus dengan uptime tinggi dan koneksi cepat ke broker server agar robot trading berjalan tanpa henti.',
    specs: ['Lokasi Server Singapore / London', 'Latensi < 5ms ke Broker', 'Garansi Uptime 99.9%'],
    linkUrl: 'https://smartapps.my.id'
  }
];
