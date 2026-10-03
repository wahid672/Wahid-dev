import React, { useState } from 'react';
import { WhatsAppIcon, TelegramIcon, CopyIcon, CheckIcon } from './Icons';

export const ContactSection: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Interactive consultation form state (submitting opens pre-formatted WhatsApp)
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState('Robot Trading MQL5 (MT5)');
  const [projectBrief, setProjectBrief] = useState('');

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const encodedMessage = encodeURIComponent(
      `Halo Mas Wahid, nama saya ${clientName || 'Klien'}.\n\nSaya tertarik konsultasi proyek:\nJenis: ${projectType}\nKebutuhan: ${projectBrief || 'Mohon info ketersediaan waktu dan alur pengerjaan.'}`
    );
    window.open(`https://wa.me/6281234567890?text=${encodedMessage}`, '_blank');
  };

  return (
    <section id="contact" className="py-16 md:py-24 border-b border-slate-200 dark:border-obsidian-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column: Direct Contact Info & Verified Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Kolaborasi &amp; Konsultasi
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mulai Diskusi Proyek Anda
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Memiliki kebutuhan pembuatan sistem software house, otomasi robot trading MetaTrader 5 (MT5), atau rancangan perangkat IoT presensi RFID? Hubungi saya langsung melalui kontak di bawah ini.
            </p>

            {/* Quick Contact Cards */}
            <div className="space-y-3">
              {/* WhatsApp direct card */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">WhatsApp Resmi</div>
                    <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      +62 812-3456-7890
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy('+6281234567890', 'wa')}
                    aria-label="Salin nomor WhatsApp"
                    className="min-h-[44px] min-w-[44px] p-2 text-xs rounded-lg border border-slate-300 dark:border-obsidian-700 bg-slate-50 dark:bg-obsidian-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {copiedField === 'wa' ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
                  </button>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Mas%20Wahid,%20saya%20tertarik%20konsultasi%20proyek"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    Chat WA
                  </a>
                </div>
              </div>

              {/* Telegram card */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <TelegramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Telegram</div>
                    <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      @wahidalimudin
                    </div>
                  </div>
                </div>
                <a
                  href="https://t.me/wahidalimudin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-obsidian-700 bg-slate-50 dark:bg-obsidian-900 hover:bg-slate-100 dark:hover:bg-obsidian-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Buka Telegram
                </a>
              </div>
            </div>

            {/* Toast feedback */}
            {copiedField && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Nomor kontak berhasil disalin ke clipboard!</span>
              </div>
            )}
          </div>

          {/* Right Column: Functional Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-300 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Formulir Rencana Proyek
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
                Kirimkan gambaran awal kebutuhan Anda. Sistem akan langsung menghubungkan pesan terstruktur ini ke WhatsApp saya untuk respon cepat.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="client-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Anda / Nama Lembaga:
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: Budi Santoso / Ponpes Darul Huda"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 dark:border-obsidian-700 bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-white text-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="project-type" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fokus Kebutuhan:
                  </label>
                  <select
                    id="project-type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 dark:border-obsidian-700 bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-white text-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <option value="Robot Trading MQL5 (MT5)">Robot Trading MQL5 MetaTrader 5</option>
                    <option value="Software House Web & App">Software House (Website / Aplikasi Web)</option>
                    <option value="Presensi IoT ESP32 & RFID">Sistem Presensi IoT RFID &amp; ESP32</option>
                    <option value="Integrasi WhatsApp Gateway">Integrasi Gateway WhatsApp (wanotif)</option>
                    <option value="Lainnya">Konsultasi Kustom / Lainnya</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="project-brief" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ringkasan Kebutuhan:
                  </label>
                  <textarea
                    id="project-brief"
                    rows={4}
                    required
                    value={projectBrief}
                    onChange={(e) => setProjectBrief(e.target.value)}
                    placeholder="Ceritakan strategi trading Anda, fitur website yang dibutuhkan, atau spesifikasi hardware yang direncanakan..."
                    className="w-full p-3.5 rounded-lg border border-slate-300 dark:border-obsidian-700 bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-white text-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Kirim Rencana ke WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
