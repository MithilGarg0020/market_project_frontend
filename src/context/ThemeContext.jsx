import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  { id: 'classic', name: 'Warm Ivory', icon: '🌾', color: '#F2A93B' },
  { id: 'emerald', name: 'Emerald Sage', icon: '🌿', color: '#2E7D32' },
  { id: 'royal', name: 'Royal Indigo', icon: '💎', color: '#3F51B5' }
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('karyana_theme_v1');
      if (saved === 'dark' || !THEMES.some((t) => t.id === saved)) {
        return 'classic';
      }
      return saved || 'classic';
    } catch {
      return 'classic';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('karyana_theme_v1', theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  }, [theme]);

  function changeTheme(newThemeId) {
    if (THEMES.some((t) => t.id === newThemeId)) {
      setTheme(newThemeId);
    }
  }

  function cycleTheme() {
    const currentIndex = THEMES.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  }

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, cycleTheme, currentTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
