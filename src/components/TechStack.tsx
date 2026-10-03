import React from 'react';
import { TECH_ITEMS } from '../data/portfolioData';
import { CpuIcon, ServerIcon, CandlestickIcon } from './Icons';

export const TechStack: React.FC = () => {
  const categories = [
    { name: 'Trading & Algo', label: 'Algoritma & Finansial', icon: CandlestickIcon },
    { name: 'Backend', label: 'Backend & High-Throughput API', icon: ServerIcon },
    { name: 'Frontend', label: 'Modern Frontend & Dashboard', icon: CpuIcon },
    { name: 'IoT & Hardware', label: 'Perangkat Embedded & RFID', icon: CpuIcon }
  ];

  return (
    <section id="tech-stack" className="py-16 md:py-24 border-b border-slate-200 dark:border-obsidian-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Keahlian Rekayasa Software &amp; Hardware
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tech Stack Software House &amp; IoT
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Kombinasi kemampuan multi-disiplin: mulai dari logika keuangan kuantitatif tingkat rendah (MQL5 MT5), sistem backend berkecepatan tinggi (Golang, Node.js), hingga firmware mikrokontroler (ESP32).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const items = TECH_ITEMS.filter((t) => t.category === cat.name);
            return (
              <div
                key={cat.name}
                className="rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-obsidian-800 pb-3">
                  <cat.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {cat.label}
                  </h3>
                </div>

                <div className="space-y-3">
                  {items.map((it) => (
                    <div
                      key={it.name}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-obsidian-900 border border-slate-200/80 dark:border-obsidian-800 space-y-1"
                    >
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {it.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {it.level}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
