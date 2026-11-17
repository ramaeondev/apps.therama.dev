
import React, { useState } from 'react';
import projectsData from '../assets/projects.json';
import { MoonIcon, SunIcon, Grid2X2, History, Home, Menu, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/projects', label: 'Repositories', icon: Grid2X2 },
    { to: '/deployments', label: 'Deployments', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#15152a]/95 text-white shadow-lg shadow-slate-950/5 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <a
          href={projectsData.profile?.website || '#'}
          className="flex w-fit items-center gap-3 transition-opacity hover:opacity-90"
        >
          <img
            src="/logo.png"
            alt="The Rama Dev"
            className="h-9 w-9 rounded-xl ring-1 ring-white/20"
          />
          <span className="hidden text-sm font-semibold tracking-[0.18em] text-white/90 sm:inline">THERAMA.DEV</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
                  active ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 focus-visible:ring-violet-300"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 focus-visible:ring-violet-300 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {menuOpen ? (
        <nav id="mobile-navigation" className="border-t border-white/10 px-5 py-3 md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                    active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
};

export default Header;
