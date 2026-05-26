import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isReady, setIsReady] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to dark theme
      applyTheme('dark');
    }
    setIsReady(true);
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      root.style.setProperty('--bg-primary', '#f5f5f5');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--bg-input', '#f0f0f0');
      root.style.setProperty('--text-primary', '#1a1a1a');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--text-muted', '#888888');
      root.style.setProperty('--border-color', '#e0e0e0');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      root.style.setProperty('--bg-primary', '#0a0e17');
      root.style.setProperty('--bg-secondary', '#111827');
      root.style.setProperty('--bg-card', '#111827');
      root.style.setProperty('--bg-input', '#1f2937');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e2e8f0');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--border-color', '#374151');
    }
  }, []);

  // Set theme and save to localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isReady,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}
