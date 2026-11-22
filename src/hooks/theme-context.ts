import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export type ResolvedTheme = 'dark' | 'light';

export type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

export const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export const THEME_STORAGE_KEY = 'therama-ui-theme';
