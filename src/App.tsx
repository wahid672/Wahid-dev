import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FoundedProducts } from './components/FoundedProducts';
import { Mql5Services } from './components/Mql5Services';
import { TechStack } from './components/TechStack';
import { AffiliateShowcase } from './components/AffiliateShowcase';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { LatestBlogCarousel } from './components/LatestBlogCarousel';
import { resetHomeSeo } from './utils/seo';

// Code-splitting via dynamic import untuk rute halaman sekunder
const BlogPage = lazy(() => import('./components/BlogPage').then((m) => ({ default: m.BlogPage })));
const LegalPage = lazy(() => import('./components/LegalPage').then((m) => ({ default: m.LegalPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-obsidian-900 flex items-center justify-center p-4">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-500 font-mono">Memuat halaman...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('wahid_theme');
      if (saved) return saved === 'dark';
      return true; // Default dark mode for developer & trading terminal theme
    } catch {
      return true;
    }
  });

  const [currentRoute, setCurrentRoute] = useState<'home' | 'terms' | 'privacy' | 'blog'>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('terms') || hash === '#terms') return 'terms';
      if (path.includes('privacy') || hash === '#privacy') return 'privacy';
      if (path.startsWith('/blog') || hash.startsWith('#blog')) return 'blog';
      return 'home';
    } catch {
      return 'home';
    }
  });

  const [blogSlug, setBlogSlug] = useState<string | undefined>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/blog/')) {
        const seg = path.replace('/blog/', '').split('/')[0].trim();
        return seg || undefined;
      }
      if (hash.startsWith('#blog/')) {
        const seg = hash.replace('#blog/', '').split('/')[0].trim();
        return seg || undefined;
      }
      return undefined;
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('wahid_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('wahid_theme', 'light');
      }
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('terms') || hash === '#terms') {
        setCurrentRoute('terms');
        setBlogSlug(undefined);
      } else if (path.includes('privacy') || hash === '#privacy') {
        setCurrentRoute('privacy');
        setBlogSlug(undefined);
      } else if (path.startsWith('/blog') || hash.startsWith('#blog')) {
        setCurrentRoute('blog');
        let slug: string | undefined = undefined;
        if (path.startsWith('/blog/')) {
          slug = path.replace('/blog/', '').split('/')[0].trim();
        } else if (hash.startsWith('#blog/')) {
          slug = hash.replace('#blog/', '').split('/')[0].trim();
        }
        setBlogSlug(slug || undefined);
      } else {
        setCurrentRoute('home');
        setBlogSlug(undefined);
        resetHomeSeo();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleOpenBlog = (slug?: string) => {
    setCurrentRoute('blog');
    setBlogSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const targetUrl = slug ? `/blog/${slug}` : '/blog';
      window.history.pushState(null, '', targetUrl);
    } catch {}
  };

  const handleOpenLegal = (tab: 'terms' | 'privacy') => {
    setCurrentRoute(tab);
    setBlogSlug(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', tab === 'terms' ? '/terms' : '/privacy');
    } catch {}
  };

  const handleBackToHome = () => {
    setCurrentRoute('home');
    setBlogSlug(undefined);
    resetHomeSeo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', '/');
    } catch {}
  };

  if (currentRoute === 'blog') {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <BlogPage
          initialSlug={blogSlug}
          onNavigateHome={handleBackToHome}
          onNavigateBlog={handleOpenBlog}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </Suspense>
    );
  }

  if (currentRoute === 'terms' || currentRoute === 'privacy') {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LegalPage
          initialTab={currentRoute}
          onBackToHome={handleBackToHome}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} onOpenBlog={() => handleOpenBlog()} />
      <main className="flex-1">
        <Hero />
        <FoundedProducts />
        <Mql5Services />
        <TechStack />
        <LatestBlogCarousel onOpenBlog={handleOpenBlog} />
        <AffiliateShowcase />
        <ContactSection />
      </main>
      <Footer onOpenLegal={handleOpenLegal} onOpenBlog={() => handleOpenBlog()} />
    </div>
  );
};

export default App;
