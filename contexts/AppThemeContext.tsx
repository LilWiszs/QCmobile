import React, { createContext, useContext, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

type AppTheme = {
  mode: ThemeMode;
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    subText: string;
    input: string;
    muted: string;
    border: string;
    primary: string;
    danger: string;
    success: string;
    warning: string;
  };
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppTheme | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const isDark = mode === 'dark';

  const colors = useMemo(
    () => ({
      background: isDark ? '#121212' : '#f2f2f7',
      card: isDark ? '#1e1e1e' : '#ffffff',
      text: isDark ? '#ffffff' : '#222222',
      subText: isDark ? '#bbbbbb' : '#666666',
      input: isDark ? '#2a2a2a' : '#f5f5f5',
      muted: isDark ? '#2a2a2a' : '#f7f8fa',
      border: isDark ? '#3a3a3a' : '#e5e7eb',
      primary: '#007AFF',
      danger: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
    }),
    [isDark]
  );

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors,
      setMode,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [mode, isDark, colors]
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
}