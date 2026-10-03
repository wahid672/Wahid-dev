---
title: "Manajemen State Ringan pada Dashboard React Menggunakan Zustand"
slug: "manajemen-state-react-tanpa-redux-dengan-zustand"
date: "2026-08-28"
author: "Wahid Alimudin"
category: "Web Development"
tags: ["React", "TypeScript", "Zustand", "Frontend", "State Management"]
summary: "Mengapa Zustand menjadi solusi ideal pengganti Redux untuk dashboard SaaS modern: setup ringkas tanpa boilerplate reducer, re-render efisien dengan selektor, dan persistensi otomatis."
readingTime: "5 menit baca"
---

# Manajemen State Ringan pada Dashboard React Menggunakan Zustand

Mengelola state global pada aplikasi web modern sering kali menjadi rumit ketika tim memutuskan menggunakan Redux Toolkit yang membutuhkan banyak boilerplate (actions, reducers, dispatchers). Untuk dashboard administrasi SaaS yang membutuhkan performa cepat dan ukuran bundle kecil, **Zustand** hadir sebagai alternatif modern berbasis hook yang sangat intuitif.

Artikel ini membahas cara membangun store Zustand pada proyek React TypeScript lengkap dengan selektor dan persistensi lokal.

---

## 1. Mengapa Memilih Zustand Dibanding Redux?

- **Zero Boilerplate**: Tidak perlu membungkus aplikasi dengan `<Provider>` context.
- **Ukuran Bundle Sangat Kecil**: Hanya sekitar ~1.1 KB gzipped, jauh lebih ringan dibanding Redux Toolkit.
- **Selektor Re-render yang Presisi**: Komponen hanya me-render ulang jika bagian state yang dilanggan (subscribed) mengalami perubahan nilai.

---

## 2. Membuat Store Zustand dengan TypeScript

Berikut contoh pembuatan store manajemen sesi pengguna dan preferensi tema:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'guru';
  tenantId: string;
}

interface AppState {
  // State
  currentUser: UserProfile | null;
  sidebarOpen: boolean;
  activeFilter: string;

  // Actions
  setCurrentUser: (user: UserProfile | null) => void;
  toggleSidebar: () => void;
  setActiveFilter: (filter: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      sidebarOpen: true,
      activeFilter: 'all',

      setCurrentUser: (user) => set({ currentUser: user }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      logout: () => set({ currentUser: null, activeFilter: 'all' })
    }),
    {
      name: 'wahid-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      // Hanya simpan currentUser dan sidebarOpen ke localStorage
      partialize: (state) => ({
        currentUser: state.currentUser,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
);
```

---

## 3. Konsumsi State di Komponen React dengan Selektor

Untuk memastikan komponen Anda tidak melakukan re-render yang tidak perlu, selalu gunakan fungsi selektor:

```tsx
import React from 'react';
import { useAppStore } from './appStore';

export const TopNavbar: React.FC = () => {
  // Hanya mendengarkan perubahan nama pengguna dan toggle action
  const userName = useAppStore((state) => state.currentUser?.name);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b">
      <button
        type="button"
        onClick={toggleSidebar}
        className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-sm font-semibold"
      >
        Menu
      </button>

      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
        Halo, {userName || 'Tamu'}
      </span>
    </header>
  );
};
```

---

## Kesimpulan

Dengan Zustand, kode manajemen state React Anda menjadi bersih, mudah dibaca, dan tidak membebani performa aplikasi dashboard SaaS Anda.
