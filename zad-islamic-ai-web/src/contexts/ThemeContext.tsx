import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'dark' | 'light';
export type AccentColor = 'purple' | 'emerald' | 'amber' | 'blue';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('zad_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Default to dark
    return 'dark';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('zad_accent_color');
    return (saved === 'emerald' || saved === 'amber' || saved === 'blue' || saved === 'purple') ? saved : 'purple';
  });

  useEffect(() => {
    localStorage.setItem('zad_theme', theme);
    const themeColor = theme === 'dark' ? '#12041f' : '#faf7ff';

    // Add/remove dark class from HTML body if needed for global Tailwind classes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dynamic browser header status bar color for mobile Chrome/Safari/Edge
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('zad_accent_color', accentColor);
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  // Clean up any legacy bgType storage
  useEffect(() => {
    localStorage.removeItem('zad_bg_type');
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isDark: theme === 'dark',
      accentColor,
      setAccentColor,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
