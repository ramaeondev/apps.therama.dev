import { useContext } from 'react';
import { ThemeProviderContext, type ThemeProviderState } from './theme-context';

/** Read the active theme. Must be used inside `<ThemeProvider>`. */
export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/** `true` when the resolved theme is dark (system preference already applied). */
export function useIsDark(): boolean {
  return useTheme().resolvedTheme === 'dark';
}
