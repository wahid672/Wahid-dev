import React, { useRef, useState, useEffect } from 'react';
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from './Icons';
import { getAllPosts } from '../blog/blogService';
import { BlogPost } from '../types';

interface LatestBlogCarouselProps {
  onOpenBlog: (slug?: string) => void;
}

export const LatestBlogCarousel: React.FC<LatestBlogCarouselProps> = ({ onOpenBlog }) => {
  const posts: BlogPost[] = getAllPosts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

      // Estimate active index based on scroll position
      const cardWidth = clientWidth > 768 ? clientWidth / 3 : clientWidth > 640 ? clientWidth / 2 : clientWidth;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(0, index), posts.length - 1));
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability, { passive: true });
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [posts.length]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth > 1024 
        ? container.clientWidth / 3 
        : container.clientWidth > 640 
          ? container.clientWidth / 2 
          : container.clientWidth * 0.85;

      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth > 1024 
        ? container.clientWidth / 3 
        : container.clientWidth > 640 
          ? container.clientWidth / 2 
          : container.clientWidth * 0.85;

      container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    }
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section id="blog-preview" className="py-16 md:py-24 border-b border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <BookOpenIcon className="w-3.5 h-3.5" />
              <span>Dokumentasi &amp; Catatan Teknis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Tutorial &amp; Artikel Rekayasa Terbaru
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Rangkuman panduan praktis pemrograman Expert Advisor MQL5, firmware mikrokontroler ESP32 RFID, serta arsitektur sistem backend.
            </p>
          </div>

          {/* Carousel Arrows & View All Link */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenBlog()}
              className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Semua Artikel ({posts.length})</span>
              <span>&rarr;</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollByAmount('left')}
                disabled={!canScrollLeft}
                aria-label="Geser ke postingan sebelumnya"
                className={`min-h-[44px] min-w-[44px] p-2.5 rounded-lg border flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  canScrollLeft
                    ? 'border-slate-300 dark:border-obsidian-700 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-800 shadow-sm cursor-pointer'
                    : 'border-slate-200 dark:border-obsidian-800 bg-slate-100 dark:bg-obsidian-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollByAmount('right')}
                disabled={!canScrollRight}
                aria-label="Geser ke postingan berikutnya"
                className={`min-h-[44px] min-w-[44px] p-2.5 rounded-lg border flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  canScrollRight
                    ? 'border-slate-300 dark:border-obsidian-700 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-800 shadow-sm cursor-pointer'
                    : 'border-slate-200 dark:border-obsidian-800 bg-slate-100 dark:bg-obsidian-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Track with CSS Scroll-Snap */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scroll-smooth scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {posts.map((post) => (
            <div
              key={post.slug}
              onClick={() => onOpenBlog(post.slug)}
              className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] p-6 rounded-2xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-850 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Meta: Category & Reading Time */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.readingTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>

              {/* Card Footer: Date & Action CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-obsidian-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.formattedDate}</span>
                </span>

                <span className="min-h-[44px] inline-flex items-center font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  Pelajari &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Slide Indicators / Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {posts.map((post, idx) => (
            <button
              key={post.slug}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Lihat artikel slide ke-${idx + 1}: ${post.title}`}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                activeIndex === idx
                  ? 'w-7 bg-emerald-500'
                  : 'w-2 bg-slate-300 dark:bg-obsidian-750 hover:bg-slate-400 dark:hover:bg-obsidian-700'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
