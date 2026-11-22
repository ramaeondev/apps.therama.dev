import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Boxes, House, Menu, Monitor, Moon, Sun, Workflow, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme-value';
import { cn } from '@/lib/utils';
import projectsData from '@/assets/projects.json';

const LOGO_SRC = 'https://cdn.therama.dev/apps/public/logo.png';

const navItems = [
  { to: '/', label: 'Overview', icon: House },
  { to: '/projects', label: 'Projects', icon: Boxes },
  { to: '/deployments', label: 'Deployments', icon: Workflow },
];

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

const SiteHeader = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu as part of navigation rather than in an effect, so the
  // state change is caused by the user action that actually triggers it.
  const closeMenu = () => setMenuOpen(false);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-40 border-b border-shell-line shell-gradient text-shell-ink backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-page items-center gap-3 px-5 sm:px-8 lg:px-12">
        <a
          href={projectsData.profile?.website || 'https://therama.dev'}
          className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-ink/60 focus-visible:ring-offset-2 focus-visible:ring-offset-shell"
          aria-label="therama.dev — opens the main site"
        >
          <img
            src={LOGO_SRC}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg ring-1 ring-shell-line transition-transform duration-300 group-hover:scale-105"
          />
          <span className="hidden text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-shell-ink/85 sm:inline">
            therama.dev
          </span>
        </a>

        <span className="hidden h-6 w-px bg-shell-line md:block" aria-hidden="true" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-ink/60',
                  active
                    ? 'bg-shell-ink/15 text-shell-ink shadow-[inset_0_0_0_1px_var(--shell-line)]'
                    : 'text-shell-ink-muted hover:bg-shell-ink/10 hover:text-shell-ink',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div
            className="hidden items-center gap-0.5 rounded-lg bg-shell-ink/10 p-0.5 sm:flex"
            role="group"
            aria-label="Colour theme"
          >
            {themeOptions.map(({ value, label, icon: Icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={active}
                  title={`${label} theme`}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-ink/60',
                    active ? 'bg-shell-ink text-shell shadow-sm' : 'text-shell-ink-muted hover:text-shell-ink',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-shell-ink transition-colors hover:bg-shell-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-ink/60 md:hidden"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile"
          className="border-t border-shell-line px-5 pb-4 pt-3 md:hidden"
        >
          <ul className="mx-auto flex max-w-page flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={closeMenu}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium',
                      active
                        ? 'bg-shell-ink/15 text-shell-ink'
                        : 'text-shell-ink-muted hover:bg-shell-ink/10 hover:text-shell-ink',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div
            className="mx-auto mt-3 flex max-w-page items-center gap-1 rounded-lg bg-shell-ink/10 p-1 sm:hidden"
            role="group"
            aria-label="Colour theme"
          >
            {themeOptions.map(({ value, label, icon: Icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={active}
                  className={cn(
                    'flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md text-xs font-medium',
                    active ? 'bg-shell-ink text-shell' : 'text-shell-ink-muted',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
};

export default SiteHeader;
