import React, { useState, useEffect } from 'react';
import { CheckIcon } from './Icons';

const TYPING_ROLES = [
  'Fullstack Software Engineer',
  'MQL5 Algorithmic Developer',
  'IoT & Embedded Systems Engineer',
  'SaaS Platform Founder',
];

export const Hero: React.FC = () => {
  // Interactive MQL5 Terminal Simulator state
  const [symbol, setSymbol] = useState<'XAUUSD' | 'EURUSD' | 'BTCUSD'>('XAUUSD');
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [balance] = useState<number>(10000);
  const [tickCount, setTickCount] = useState<number>(142);
  const [simulatedProfit, setSimulatedProfit] = useState<number>(185.50);

  // Typewriter animation state for hero subtitle
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const currentTarget = TYPING_ROLES[roleIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayText.length < currentTarget.length) {
        // Typing speed: 80ms per character
        timer = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        }, 80);
      } else {
        // Pause at completion of role: 2000ms
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        // Deleting speed: 40ms per character
        timer = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length - 1));
        }, 40);
      } else {
        // Pause after deleting before typing next role: 350ms
        timer = setTimeout(() => {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % TYPING_ROLES.length);
        }, 350);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, prefersReducedMotion]);

  // Dynamic lot size based on 1% risk of $10,000 balance with 50 pip stop loss
  const calculatedLot = ((balance * (riskPercent / 100)) / 500).toFixed(2);

  const handleSimulateTick = () => {
    setTickCount((prev) => prev + 1);
    const delta = (Math.random() * 30 - 12);
    setSimulatedProfit((prev) => +(prev + delta).toFixed(2));
  };

  return (
    <section id="about" className="pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-200 dark:border-obsidian-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Personal Brand & Verified Capabilities */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status indicator badge (R-09: functional status, not generic AI capsule) */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Menerima Proyek Software House, MQL5, &amp; IoT</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Wahid Alimudin
              </h1>
              <div className="min-h-[1.75rem] sm:min-h-[2rem] flex items-center">
                <p className="text-lg sm:text-xl font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="sr-only">
                    Fullstack Software Engineer, MQL5 Algorithmic Developer, IoT &amp; Embedded Systems Engineer, SaaS Platform Founder
                  </span>
                  <span aria-hidden="true" className="inline-flex items-center">
                    {prefersReducedMotion ? (
                      'Fullstack Software Engineer & MQL5 Algorithmic Developer'
                    ) : (
                      <>
                        <span>{displayText}</span>
                        <span
                          className="inline-block w-[2px] h-[1.15em] ml-1 bg-emerald-500 dark:bg-emerald-400 animate-pulse align-middle"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </span>
                </p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Membangun platform aplikasi web skala produksi (React, Node.js, PHP, Golang), otomasi robot trading Expert Advisor MetaTrader 5 (MT5), sistem presensi IoT ESP32 berbasis RFID, serta kurator perangkat teknologi via Shopee dan TikTok Affiliate.
            </p>

            {/* Quick Proof Pills (Real verified founding platforms) */}
            <div className="space-y-2 pt-1">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                Founder Platform Aktif:
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {['siakadponpes.com', 'psbonline.id', 'wanotif.web.id', 'presensirfid.web.id', 'smartapps.my.id'].map((site) => (
                  <span
                    key={site}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-obsidian-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-800"
                  >
                    {site}
                  </span>
                ))}
              </div>
            </div>

            {/* Specific CTAs (R-15 compliant) */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <a
                href="#products"
                className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Lihat 5 Produk SaaS Live
              </a>
              <a
                href="#mql5"
                className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-obsidian-700 bg-white hover:bg-slate-100 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-800 dark:text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Layanan Robot MQL5 MT5
              </a>
              <a
                href="#contact"
                className="min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
              >
                Hubungi via WhatsApp
              </a>
            </div>
          </div>

          {/* Right Column: Interactive MQL5 MT5 Algorithm Simulator Card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-300 dark:border-obsidian-800 bg-slate-900 text-slate-100 p-5 shadow-lg space-y-4 font-mono text-sm">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    MT5 Expert Advisor Engine
                  </span>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  MQL5 Native
                </span>
              </div>

              {/* Symbol selector tabs */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Pilih Pasangan Trading:</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {(['XAUUSD', 'EURUSD', 'BTCUSD'] as const).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setSymbol(sym)}
                      className={`min-h-[36px] py-1.5 text-xs font-semibold rounded transition-colors ${
                        symbol === sym
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Algorithm Parameters Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Symbol Terpilih</div>
                  <div className="font-bold text-slate-200 mt-0.5">{symbol}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Trailing Stop Engine</div>
                  <div className="font-bold text-cyan-400 mt-0.5">ATR Volatility Adaptif</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Kalkulasi Lot Otomatis</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{calculatedLot} Lot</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Ticks Diproses</div>
                  <div className="font-bold text-slate-200 mt-0.5">{tickCount} Ticks</div>
                </div>
              </div>

              {/* Interactive Risk Slider */}
              <div className="space-y-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Manajemen Risiko (% Modal):</span>
                  <span className="font-bold text-emerald-400">{riskPercent}% ($100 per trade)</span>
                </div>
                <div className="flex gap-2">
                  {[0.5, 1.0, 2.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRiskPercent(val)}
                      className={`min-h-[36px] flex-1 text-xs py-1 rounded border transition-colors ${
                        riskPercent === val
                          ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300 font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Floating PnL Display & Trigger Button */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-400 block">Floating Profit Simulasi:</span>
                  <span className={`text-base font-bold ${simulatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simulatedProfit >= 0 ? `+$${simulatedProfit.toFixed(2)}` : `-$${Math.abs(simulatedProfit).toFixed(2)}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateTick}
                  className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Simulasikan Tick Baru
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Logika MQL5 murni tanpa ketergantungan library pihak ketiga.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
