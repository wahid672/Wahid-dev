import React from 'react';
import { MQL5_SERVICES } from '../data/portfolioData';
import { TerminalIcon, ShieldIcon, CheckIcon, WhatsAppIcon } from './Icons';

export const Mql5Services: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Diskusi Rule & Logika Trading',
      desc: 'Anda memaparkan aturan entri, proteksi stop loss, target take profit, filter spread, serta jam perdagangan yang diinginkan.'
    },
    {
      num: '02',
      title: 'Koding Arsitektur MQL5 Murni',
      desc: 'Penulisan kode Expert Advisor berorientasi objek (OOP) di MetaTrader 5 dengan penanganan error trading dan eksekusi latensi rendah.'
    },
    {
      num: '03',
      title: 'Audit Strategy Tester & Data Tick',
      desc: 'Pengujian ketahanan algoritma pada Strategy Tester MT5 menggunakan model data tick real historis untuk mengukur drawdown sebenarnya.'
    },
    {
      num: '04',
      title: 'Serah Terima File & Panduan VPS',
      desc: 'Pemberian file binary .ex5 atau source code .mq5 lengkap dengan panduan instalasi di terminal MT5 atau VPS trading 24/7.'
    }
  ];

  return (
    <section id="mql5" className="py-16 md:py-24 border-b border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
            Algorithmic Trading &amp; Quant Developer
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Layanan Pengembangan Robot Trading MQL5 (MT5)
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Mengotomatiskan strategi trading Anda ke dalam kode MetaTrader 5 dengan penekanan utama pada manajemen risiko modal, filter spread, eksekusi asinkron, dan kestabilan jangka panjang.
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {MQL5_SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-200 dark:border-cyan-900">
                  {srv.tag}
                </span>
                <TerminalIcon className="w-5 h-5 text-slate-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {srv.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {srv.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-obsidian-800 space-y-2">
                {srv.details.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Development Workflow (4 Steps - RHYTHM variation) */}
        <div className="rounded-xl border border-slate-300 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-obsidian-800 pb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Alur Pengerjaan Robot Trading MQL5
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Transparan, terstruktur, dan teruji sebelum Anda gunakan pada akun trading real.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => (
              <div key={st.num} className="space-y-2">
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {st.num}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {st.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-obsidian-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <ShieldIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Semua logika strategi dan source code klien dijaga kerahasiaannya.</span>
            </div>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Mas%20Wahid,%20saya%20ingin%20konsultasi%20pembuatan%20Robot%20Trading%20EA%20MQL5%20MT5"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Konsultasikan Strategi via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
