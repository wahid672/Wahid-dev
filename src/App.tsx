import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FoundedProducts } from './components/FoundedProducts';
import { Mql5Services } from './components/Mql5Services';
import { TechStack } from './components/TechStack';
import { AffiliateShowcase } from './components/AffiliateShowcase';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { LegalPage } from './components/LegalPage';

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

  const [currentRoute, setCurrentRoute] = useState<'home' | 'terms' | 'privacy'>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('terms') || hash === '#terms') return 'terms';
      if (path.includes('privacy') || hash === '#privacy') return 'privacy';
      return 'home';
    } catch {
      return 'home';
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
      } else if (path.includes('privacy') || hash === '#privacy') {
        setCurrentRoute('privacy');
      } else {
        setCurrentRoute('home');
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

  const handleOpenLegal = (tab: 'terms' | 'privacy') => {
    setCurrentRoute(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', tab === 'terms' ? '/terms' : '/privacy');
    } catch {}
  };

  const handleBackToHome = () => {
    setCurrentRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', '/');
    } catch {}
  };

  if (currentRoute === 'terms' || currentRoute === 'privacy') {
    return (
      <LegalPage
        initialTab={currentRoute}
        onBackToHome={handleBackToHome}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1">
        <Hero />
        <FoundedProducts />
        <Mql5Services />
        <TechStack />
        <AffiliateShowcase />
        <ContactSection />
      </main>
      <Footer onOpenLegal={handleOpenLegal} />
    </div>
  );
};

export default App;
