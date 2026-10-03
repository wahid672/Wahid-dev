import React, { useState } from 'react';
import { AFFILIATE_ITEMS } from '../data/portfolioData';
import { ShoppingBagIcon, ExternalLinkIcon, CheckIcon } from './Icons';

type AffiliateFilter = 'all' | 'Shopee Affiliate' | 'TikTok Affiliate' | 'VPS Partner';

export const AffiliateShowcase: React.FC = () => {
  const [filter, setFilter] = useState<AffiliateFilter>('all');

  const filteredItems = filter === 'all'
    ? AFFILIATE_ITEMS
    : AFFILIATE_ITEMS.filter((item) => item.platform === filter);

  return (
    <section id="affiliate" className="py-16 md:py-24 border-b border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Rekomendasi Terkurasi &amp; Partner
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Etalase Gear Developer &amp; Trader
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Perangkat mikrokontroler, modul IoT, dan perlengkapan setup kerja yang saya gunakan sehari-hari dalam coding software serta monitoring chart trading, terkurasi via program Shopee dan TikTok Affiliate.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'Semua Rekomendasi' },
            { id: 'Shopee Affiliate', label: 'Shopee Affiliate' },
            { id: 'TikTok Affiliate', label: 'TikTok Affiliate' },
            { id: 'VPS Partner', label: 'Infrastruktur VPS' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as AffiliateFilter)}
              className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                filter === tab.id
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'bg-white hover:bg-slate-100 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-obsidian-750'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Affiliate Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 p-6 shadow-sm hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                    {item.platform}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  {item.specs.map((sp, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-obsidian-800">
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  <span>Lihat Produk Rekomendasi</span>
                  <ExternalLinkIcon className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate Transparency Note */}
        <div className="mt-10 p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white/70 dark:bg-obsidian-900/70 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">Keterbukaan Afiliasi: </strong>
          Tautan pada etalase ini merupakan tautan afiliasi resmi Shopee dan TikTok. Jika Anda melakukan pembelian melalui tautan tersebut, saya dapat menerima komisi rujukan tanpa membebankan biaya tambahan apa pun pada harga yang Anda bayar. Terima kasih atas dukungannya.
        </div>
      </div>
    </section>
  );
};
