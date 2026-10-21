import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
}

const getInitialTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('roadguard_theme');
    if (saved) return saved === 'dark';
  }
  return true; // Default to Obsidian dark
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const next = !state.isDark;
      if (typeof window !== 'undefined') {
        localStorage.setItem('roadguard_theme', next ? 'dark' : 'light');
        if (next) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
      return { isDark: next };
    });
  },
  setDark: (dark: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('roadguard_theme', dark ? 'dark' : 'light');
      if (dark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
    set({ isDark: dark });
  },
}));
