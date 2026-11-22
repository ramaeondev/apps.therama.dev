import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';

interface AppShellProps {
  children: ReactNode;
  /** Optional full-bleed footer rendered below the page container. */
  footer?: ReactNode;
  /** Suppress the default page padding for full-bleed sections. */
  bleed?: boolean;
}

/**
 * The single page container. Every route renders inside it so the header, max
 * width, gutters and vertical rhythm stay identical across the portfolio and
 * the operational workspace.
 *
 * The header lives here (outside the padded `main`) so it always spans the full
 * viewport width and can stick to the top of the window.
 */
const AppShell = ({ children, footer, bleed = false }: AppShellProps) => (
  <div className="flex min-h-dvh flex-col bg-canvas text-ink">
    <SiteHeader />
    <main
      className={
        bleed
          ? 'flex-1'
          : 'mx-auto w-full max-w-page flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:px-12'
      }
    >
      {children}
    </main>
    {footer}
  </div>
);

export default AppShell;

