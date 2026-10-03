import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FoundedProducts } from './components/FoundedProducts';
import { Mql5Services } from './components/Mql5Services';
import { TechStack } from './components/TechStack';
import { AffiliateShowcase } from './components/AffiliateShowcase';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

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

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

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
      <Footer />
    </div>
  );
};

export default App;
