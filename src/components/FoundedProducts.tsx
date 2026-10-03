import React, { useState } from 'react';
import { FOUNDED_PRODUCTS } from '../data/portfolioData';
import { ExternalLinkIcon } from './Icons';

type CategoryFilter = 'all' | 'academic' | 'automation' | 'iot' | 'business';

export const FoundedProducts: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredProducts = activeCategory === 'all'
    ? FOUNDED_PRODUCTS
    : FOUNDED_PRODUCTS.filter((item) => item.category === activeCategory);

  const filterTabs: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'Semua Produk (5)' },
    { id: 'academic', label: 'SaaS Akademik (2)' },
    { id: 'automation', label: 'Automasi & Gateway (1)' },
    { id: 'iot', label: 'IoT & RFID (1)' },
    { id: 'business', label: 'Solusi Bisnis (1)' }
  ];

  return (
    <section id="products" className="py-16 md:py-24 border-b border-slate-200 dark:border-obsidian-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Karya Nyata &amp; SaaS Produksi
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Produk &amp; Platform yang Didirikan
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Bukan sekadar konsep atau mockup statis, berikut adalah platform digital dan sistem terintegrasi yang telah saya rancang, kembangkan, dan operasikan secara langsung untuk kebutuhan institusi, pesantren, dan bisnis digital.
          </p>
        </div>

        {/* Category Filter Tabs (R-26 interactive control) */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                activeCategory === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-obsidian-750'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid (C-3 content-driven, R-14 variation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 p-6 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-colors"
            >
              <div className="space-y-4">
                {/* Header: Category and Live Status */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                    {product.categoryLabel}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {product.status}
                  </span>
                </div>

                {/* Title & Domain */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {product.name}
                  </h3>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {product.domain}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.description}
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs font-mono rounded bg-slate-100 dark:bg-obsidian-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Link (R-26: real working destination) */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-obsidian-800">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-obsidian-700 bg-slate-50 hover:bg-slate-100 dark:bg-obsidian-900 dark:hover:bg-obsidian-800 text-slate-800 dark:text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <span>Kunjungi {product.domain}</span>
                  <ExternalLinkIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state (R-27 compliance) */}
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-obsidian-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tidak ada produk pada kategori ini.
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold underline"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
