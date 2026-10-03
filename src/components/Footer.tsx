import React from 'react';

interface FooterProps {
  onOpenLegal?: (tab: 'terms' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="bg-slate-100 dark:bg-obsidian-950 text-slate-600 dark:text-slate-400 py-12 border-t border-slate-200 dark:border-obsidian-800 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-obsidian-800">
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-base block">
              Wahid Alimudin
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs">
              Software Engineer, MQL5 Developer, &amp; Tech Creator
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <a href="#about" className="hover:text-emerald-600 dark:hover:text-emerald-400">Tentang</a>
            <a href="#products" className="hover:text-emerald-600 dark:hover:text-emerald-400">Produk SaaS</a>
            <a href="#mql5" className="hover:text-emerald-600 dark:hover:text-emerald-400">Robot MQL5</a>
            <a href="#tech-stack" className="hover:text-emerald-600 dark:hover:text-emerald-400">Tech Stack</a>
            <a href="#affiliate" className="hover:text-emerald-600 dark:hover:text-emerald-400">Gear Afiliasi</a>
            <a href="#contact" className="hover:text-emerald-600 dark:hover:text-emerald-400">Kontak</a>
          </div>
        </div>

        {/* Legal Disclaimers (Trading Risk & Affiliate Transparency) */}
        <div className="space-y-3 leading-relaxed text-[11px] text-slate-500 dark:text-slate-500">
          <p>
            <strong className="text-slate-700 dark:text-slate-400">Pemberitahuan Risiko Finansial: </strong>
            Trading valuta asing (forex), komoditas, dan aset derivatif dengan Expert Advisor (EA) MetaTrader 5 melibatkan risiko tinggi terhadap modal Anda. Hasil pengujian masa lalu (backtesting) atau simulasi algoritma tidak menjamin hasil profit di masa depan. Selalu gunakan lot bijak dan manajemen risiko yang terukur.
          </p>
          <p>
            <strong className="text-slate-700 dark:text-slate-400">Keterbukaan Program Afiliasi: </strong>
            Tautan produk Shopee dan TikTok pada halaman ini merupakan tautan referral resmi. Pembelian yang dilakukan melalui tautan tersebut memberikan komisi tanpa menambah biaya pembelian Anda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-obsidian-850 text-slate-500 text-[11px]">
          <div>
            &copy; 2026 Wahid Alimudin. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onOpenLegal?.('terms')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2"
            >
              Syarat &amp; Ketentuan
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => onOpenLegal?.('privacy')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2"
            >
              Kebijakan Privasi
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
