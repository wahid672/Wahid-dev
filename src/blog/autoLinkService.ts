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
  { keyword: 'RFID RC522', slug: 'perbedaan-sensor-rfid-rc522-dan-pn532-nfc' },
  { keyword: 'Deep Sleep', slug: 'tutorial-esp32-deep-sleep-manajemen-daya-baterai' },
  { keyword: 'RISC-V', slug: 'arsitektur-risc-v-pada-mikrokontroler-iot-modern' },
  { keyword: 'PN532', slug: 'perbedaan-sensor-rfid-rc522-dan-pn532-nfc' },
  { keyword: 'RC522', slug: 'perbedaan-sensor-rfid-rc522-dan-pn532-nfc' },
  { keyword: 'ESP32', slug: 'integrasi-esp32-rfid-rc522-dashboard-web' },
  { keyword: 'MQTT', slug: 'komunikasi-mqtt-esp32-broker-cloud-iot' },

  // Web Engineering, Cloud & Database
  { keyword: 'Cloudflare Workers', slug: 'tutorial-serverless-api-cloudflare-workers-d1' },
  { keyword: 'WhatsApp Gateway', slug: 'otomasi-notifikasi-whatsapp-gateway-node-js' },
  { keyword: 'Redis Streams', slug: 'tutorial-redis-streams-event-driven-architecture' },
  { keyword: 'Multi-Tenant', slug: 'arsitektur-multi-tenant-siakad-pondok-pesantren' },
  { keyword: 'Worker Pool', slug: 'tutorial-golang-worker-pool-concurrency-api' },
  { keyword: 'Git Rebase', slug: 'tutorial-git-interactive-rebase-dan-bisect' },
  { keyword: 'Dockerfile', slug: 'tutorial-optimasi-dockerfile-multi-stage-build' },
  { keyword: 'PSB Online', slug: 'arsitektur-psb-online-verifikasi-berkas-dan-pembayaran' },
  { keyword: 'PostgreSQL', slug: 'optimasi-query-postgresql-indexing-aplikasi-akademik' },
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

  // Video Iklan, Creator & Affiliate
  { keyword: 'Shopee Affiliate', slug: 'trik-bikin-video-iklan-shopee-affiliate-otomatis-dari-link-produk' },
  { keyword: 'TikTok Affiliate', slug: 'panduan-membuat-video-iklan-ai-ugc-tiktok-affiliate-cuan' },
  { keyword: 'Faceless Channel', slug: 'rahasia-video-iklan-faceless-channel-monetisasi-global' },
  { keyword: 'Video Iklan AI', slug: 'panduan-membuat-video-iklan-ai-ugc-tiktok-affiliate-cuan' },
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
  { keyword: 'Kerja Remote', slug: 'platform-kerja-remote-luar-negeri-terbaik-gaji-dolar' },
  { keyword: 'Gaji Dolar', slug: 'cara-menerima-gaji-dolar-rekening-bank-indonesia-wise-payoneer' },
  { keyword: 'Mistplay', slug: 'cara-kerja-mistplay-dan-ekosistem-reward-game-android' },
  { keyword: 'LinkedIn', slug: 'cara-optimasi-profil-linkedin-recruiter-asing-klien-dolar' },
  { keyword: 'Wise', slug: 'cara-menerima-gaji-dolar-rekening-bank-indonesia-wise-payoneer' }
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
