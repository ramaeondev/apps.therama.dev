import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/hooks/use-theme';
import { Toaster } from '@/components/ui/sonner';
import Portfolio from '@/pages/Portfolio';

/**
 * The portfolio is the landing route, so it stays in the main bundle. The two
 * operational workspaces pull in AG Grid and Recharts, which are large, so they
 * are code-split and only fetched when visited.
 */
const Repositories = lazy(() => import('@/pages/Repositories'));
const Deployments = lazy(() => import('@/pages/Deployments'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Neutral route-level fallback; each page renders its own skeletons. */
const RouteFallback = () => (
  <div className="flex min-h-dvh items-center justify-center bg-canvas" role="status" aria-live="polite">
    <span className="sr-only">Loading page…</span>
    <span
      className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-action"
      aria-hidden="true"
    />
  </div>
);

const App = () => (
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route
            path="/projects"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Repositories />
              </Suspense>
            }
          />
          <Route
            path="/deployments"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Deployments />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteFallback />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
