import React, { useState, useEffect, useMemo } from 'react';
import {
  SunIcon,
  MoonIcon,
  BookOpenIcon,
  SearchIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  ArrowLeftIcon,
  ShareIcon,
  CheckIcon,
  WhatsAppIcon,
  TelegramIcon,
  ExternalLinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  getAllPosts,
  getPostBySlug,
  getCategories,
  extractToc,
  getRelatedPosts
} from '../blog/blogService';
import { setBlogIndexSeo, setBlogPostSeo } from '../utils/seo';
import { BlogPost, TocItem } from '../types';

interface BlogPageProps {
  initialSlug?: string;
  onNavigateHome: () => void;
  onNavigateBlog: (slug?: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  initialSlug,
  onNavigateHome,
  onNavigateBlog,
  darkMode,
  toggleDarkMode
}) => {
  const [activeSlug, setActiveSlug] = useState<string | undefined>(initialSlug);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const POSTS_PER_PAGE = 10;

  // Sync state if initialSlug prop changes from parent router
  useEffect(() => {
    setActiveSlug(initialSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Restore cached HitPulse counts in BlogPage footer
    const cachedTotal = sessionStorage.getItem('hp_total');
    const cachedToday = sessionStorage.getItem('hp_today');
    if (cachedTotal || cachedToday) {
      document.querySelectorAll<HTMLElement>('[data-hitpulse="total"]').forEach((el) => {
        if (cachedTotal) el.textContent = cachedTotal;
      });
      document.querySelectorAll<HTMLElement>('[data-hitpulse="today"]').forEach((el) => {
        if (cachedToday) el.textContent = cachedToday;
      });
    }
  }, [initialSlug]);

  const allPosts = useMemo(() => getAllPosts(), []);
  const categories = useMemo(() => ['Semua', ...getCategories()], []);

  // Current active post if viewing single post
  const currentPost: BlogPost | undefined = useMemo(() => {
    if (!activeSlug) return undefined;
    return getPostBySlug(activeSlug);
  }, [activeSlug]);

  // Extract table of contents for current post
  const tableOfContents: TocItem[] = useMemo(() => {
    if (!currentPost) return [];
    return extractToc(currentPost.content);
  }, [currentPost]);

  // Related posts
  const relatedPosts = useMemo(() => {
    if (!currentPost) return [];
    return getRelatedPosts(currentPost.slug, 2);
  }, [currentPost]);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchCategory =
        selectedCategory === 'Semua' || post.category === selectedCategory;

      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const inTitle = post.title.toLowerCase().includes(query);
      const inSummary = post.summary.toLowerCase().includes(query);
      const inTags = post.tags.some((tag) => tag.toLowerCase().includes(query));

      return inTitle || inSummary || inTags;
    });
  }, [allPosts, selectedCategory, searchQuery]);
 
  // Reset pagination to page 1 whenever category or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Pagination calculations
  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedPosts = useMemo(() => {
    const start = (safeCurrentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, safeCurrentPage]);

  const startPostIndex = totalPosts === 0 ? 0 : (safeCurrentPage - 1) * POSTS_PER_PAGE + 1;
  const endPostIndex = Math.min(safeCurrentPage * POSTS_PER_PAGE, totalPosts);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  }, [totalPages, safeCurrentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
    const searchSection = document.getElementById('blog-search');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle SEO dynamic updates
  useEffect(() => {
    if (currentPost) {
      setBlogPostSeo(currentPost);
    } else {
      setBlogIndexSeo(allPosts);
    }
  }, [currentPost, allPosts]);

  const handleSelectPost = (slug: string) => {
    setActiveSlug(slug);
    onNavigateBlog(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBlogList = () => {
    setActiveSlug(undefined);
    onNavigateBlog(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPostLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Gagal menyalin tautan:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-obsidian-950/95 backdrop-blur-md border-b border-slate-200 dark:border-obsidian-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            >
              <img
                src="/logo.svg"
                alt="Logo Wahid Alimudin"
                className="w-8 h-8 rounded-lg shadow-sm"
              />
              <span className="font-bold text-base hidden sm:inline">Wahid Alimudin</span>
            </button>

            <span className="text-slate-300 dark:text-obsidian-750">|</span>

            {activeSlug ? (
              <button
                type="button"
                onClick={handleBackToBlogList}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline min-h-[44px] px-2 py-1"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Semua Artikel</span>
              </button>
            ) : (
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Blog &amp; Tutorial
              </span>
            )}
          </div>

          {/* Action buttons: Theme Toggle & Back to Home */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-slate-300 dark:border-obsidian-700 bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {darkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-700" />}
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-obsidian-700 bg-white dark:bg-obsidian-850 hover:bg-slate-50 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Beranda
            </button>
          </div>
        </div>
      </header>

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* VIEW 1: SINGLE ARTICLE DETAIL */}
        {currentPost ? (
          <article className="max-w-4xl mx-auto space-y-8 min-w-0 w-full overflow-hidden">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="text-xs font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:underline text-emerald-600 dark:text-emerald-400"
              >
                Beranda
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={handleBackToBlogList}
                className="hover:underline text-emerald-600 dark:text-emerald-400"
              >
                Blog
              </button>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                {currentPost.title}
              </span>
            </nav>

            {/* Post Header */}
            <header className="space-y-4 border-b border-slate-200 dark:border-obsidian-800 pb-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
                  {currentPost.category}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <time dateTime={currentPost.date}>{currentPost.formattedDate}</time>
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentPost.readingTime}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {currentPost.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentPost.summary}
              </p>

              {/* Author & Share Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-obsidian-850">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    WA
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {currentPost.author}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Software Engineer &amp; MQL5 Developer
                    </span>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Bagikan:</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `${currentPost.title} - https://wahidalimudin.web.id/blog/${currentPost.slug}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bagikan artikel ke WhatsApp"
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 hover:bg-slate-50 dark:hover:bg-obsidian-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      `https://wahidalimudin.web.id/blog/${currentPost.slug}`
                    )}&text=${encodeURIComponent(currentPost.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bagikan artikel ke Telegram"
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 hover:bg-slate-50 dark:hover:bg-obsidian-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <TelegramIcon className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPostLink}
                    aria-label="Salin tautan artikel ke clipboard"
                    className="min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 hover:bg-slate-50 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {copiedLink ? (
                      <>
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <ShareIcon className="w-4 h-4 text-slate-500" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </header>

            {/* Table of Contents for Mobile View (Collapsible) */}
            {tableOfContents.length > 0 && (
              <div className="lg:hidden p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 shadow-sm">
                <button
                  type="button"
                  onClick={() => setMobileTocOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <BookOpenIcon className="w-4 h-4 text-emerald-500" />
                    <span>Daftar Isi Artikel ({tableOfContents.length})</span>
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    {mobileTocOpen ? 'Tutup' : 'Buka'}
                  </span>
                </button>

                {mobileTocOpen && (
                  <ul className="mt-3 pt-3 border-t border-slate-200 dark:border-obsidian-800 space-y-2 text-xs">
                    {tableOfContents.map((item) => (
                      <li
                        key={item.id}
                        className={item.level === 3 ? 'pl-4' : 'font-medium'}
                      >
                        <a
                          href={`#${item.id}`}
                          onClick={() => setMobileTocOpen(false)}
                          className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 block py-1"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Content & Desktop TOC Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-w-0 w-full">
              {/* Main Markdown Body */}
              <div className="lg:col-span-3 min-w-0 w-full">
                <MarkdownRenderer
                  content={currentPost.content}
                  currentSlug={currentPost.slug}
                  relatedPost={relatedPosts[0]}
                  onNavigatePost={handleSelectPost}
                />

                {/* Article Tags */}
                <div className="pt-8 mt-10 border-t border-slate-200 dark:border-obsidian-800 space-y-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Topik Terkait</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-obsidian-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-750"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author Bio Card */}
                <div className="my-10 p-6 rounded-2xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow">
                    WA
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Ditulis oleh Wahid Alimudin
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Fullstack Software Engineer dan Developer Robot Trading MQL5 (MetaTrader 5). Founder dari platform siakadponpes.com, wanotif.web.id, dan presensirfid.web.id.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <a
                        href="https://wa.me/6281540983390"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Konsultasi Proyek via WhatsApp</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-obsidian-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Artikel Rekomendasi Lainnya
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {relatedPosts.map((related) => (
                        <div
                          key={related.slug}
                          onClick={() => handleSelectPost(related.slug)}
                          className="p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all cursor-pointer space-y-2 group shadow-sm"
                        >
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                            {related.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <span className="text-xs text-slate-500 font-mono block">
                            {related.readingTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to Blog List CTA */}
                <div className="pt-8 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleBackToBlogList}
                    className="min-h-[44px] px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    &larr; Kembali ke Indeks Blog
                  </button>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="min-h-[44px] px-3 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    &uarr; Kembali ke Atas
                  </button>
                </div>
              </div>

              {/* Desktop Sticky Table of Contents Sidebar */}
              <aside className="hidden lg:block lg:col-span-1">
                {tableOfContents.length > 0 && (
                  <div className="sticky top-24 p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      <BookOpenIcon className="w-4 h-4 text-emerald-500" />
                      <span>Daftar Isi</span>
                    </div>
                    <ul className="space-y-2 text-xs border-l-2 border-slate-200 dark:border-obsidian-750 pl-3">
                      {tableOfContents.map((item) => (
                        <li key={item.id} className={item.level === 3 ? 'pl-2 text-[11px]' : ''}>
                          <a
                            href={`#${item.id}`}
                            className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block py-0.5"
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            </div>
          </article>
        ) : (
          /* VIEW 2: BLOG POSTS LIST / INDEX */
          <div className="space-y-10">
            {/* Header / Hero Section */}
            <div className="space-y-4 max-w-3xl">
              <nav aria-label="Breadcrumb" className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="hover:underline text-emerald-600 dark:text-emerald-400"
                >
                  Beranda
                </button>
                <span>/</span>
                <span>Blog &amp; Tutorial</span>
              </nav>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Blog &amp; Tutorial Teknikal
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Catatan teknis, dokumentasi implementasi kode MQL5 untuk MetaTrader 5, panduan hardware mikrokontroler IoT ESP32, dan arsitektur sistem informasi web modern.
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="space-y-4 p-5 rounded-2xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 shadow-sm">
              <div className="relative">
                <label htmlFor="blog-search" className="sr-only">
                  Cari artikel berdasarkan judul, topik, atau kata kunci
                </label>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <SearchIcon className="w-5 h-5" />
                </div>
                <input
                  id="blog-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari artikel tutorial (contoh: MQL5, ESP32, Multi-Tenant, WhatsApp)..."
                  className="w-full min-h-[48px] pl-11 pr-24 py-2.5 rounded-xl border border-slate-300 dark:border-obsidian-700 bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 px-3.5 min-h-[48px] flex items-center text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                {categories.map((cat) => {
                  const count =
                    cat === 'Semua'
                      ? allPosts.length
                      : allPosts.filter((p) => p.category === cat).length;
                  const isActive = selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-800 dark:hover:bg-obsidian-750 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{cat}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                          isActive
                            ? 'bg-emerald-700 text-emerald-100'
                            : 'bg-slate-200 dark:bg-obsidian-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Articles List / Grid */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-8 min-w-0 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                  {paginatedPosts.map((post) => (
                    <article
                      key={post.slug}
                      onClick={() => handleSelectPost(post.slug)}
                      className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group space-y-4 min-w-0"
                    >
                      <div className="space-y-3 min-w-0">
                        {/* Meta: Category & Date */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="px-2.5 py-1 rounded-md font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            <time dateTime={post.date}>{post.formattedDate}</time>
                            <span>&bull;</span>
                            <span>{post.readingTime}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug break-words [overflow-wrap:anywhere]">
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed break-words [overflow-wrap:anywhere]">
                          {post.summary}
                        </p>
                      </div>

                      {/* Footer: Tags & Read Action */}
                      <div className="pt-4 border-t border-slate-100 dark:border-obsidian-800 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5 min-w-0">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-obsidian-900 text-slate-600 dark:text-slate-400 truncate max-w-[140px]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <span className="min-h-[44px] shrink-0 inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                          Baca Selengkapnya &rarr;
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Paginasi Artikel Blog"
                    className="pt-6 sm:pt-8 border-t border-slate-200 dark:border-obsidian-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    {/* Information Text */}
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 text-center sm:text-left">
                      Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{startPostIndex}-{endPostIndex}</span> dari{' '}
                      <span className="font-semibold text-slate-900 dark:text-white">{totalPosts}</span> artikel
                    </p>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Prev button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        aria-label="Ke halaman sebelumnya"
                        className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 hover:bg-slate-100 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-300 shadow-sm"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      {/* Mobile compact indicator */}
                      <div className="sm:hidden px-3.5 min-h-[44px] flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-obsidian-850 rounded-xl border border-slate-200 dark:border-obsidian-750">
                        <span>{safeCurrentPage} / {totalPages}</span>
                      </div>

                      {/* Desktop numbered buttons */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {pageNumbers.map((page, idx) => {
                          if (page === '...') {
                            return (
                              <span
                                key={`ellipsis-${idx}`}
                                className="min-h-[44px] min-w-[36px] flex items-center justify-center text-xs text-slate-400 font-mono select-none"
                              >
                                ...
                              </span>
                            );
                          }

                          const pageNum = page as number;
                          const isActive = pageNum === safeCurrentPage;

                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => handlePageChange(pageNum)}
                              aria-current={isActive ? 'page' : undefined}
                              aria-label={`Buka halaman ${pageNum}`}
                              className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                isActive
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                  : 'border border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 hover:bg-slate-100 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        aria-label="Ke halaman berikutnya"
                        className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 hover:bg-slate-100 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-300 shadow-sm"
                      >
                        <span className="hidden sm:inline">Berikutnya</span>
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </nav>
                )}
              </div>
            ) : (
              /* EMPTY STATE (R-27 compliant) */
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-obsidian-800 text-slate-400 flex items-center justify-center">
                  <SearchIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tidak ada artikel yang cocok
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Kriteria pencarian &ldquo;{searchQuery}&rdquo; pada kategori &ldquo;{selectedCategory}&rdquo; tidak menghasilkan artikel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                >
                  Reset Filter &amp; Pencarian
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-obsidian-800 py-8 bg-slate-100 dark:bg-obsidian-950 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Wahid Alimudin</span>
            <span className="mx-2">&bull;</span>
            <span>Blog &amp; Tutorial Teknikal</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-obsidian-900 px-2.5 py-1 rounded border border-slate-300/60 dark:border-obsidian-800">
              Total: <span data-hitpulse="total">0</span> · Hari ini: <span data-hitpulse="today">0</span>
            </span>
            <span>&copy; 2026 Wahid Alimudin. Hak Cipta Dilindungi.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
