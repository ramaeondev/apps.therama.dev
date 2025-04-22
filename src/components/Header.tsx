
import React from 'react';
import projectsData from '../assets/projects.json';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const developerName = projectsData.profile?.name || 'Rama Reddy';

  return (
    <header className="bg-dark-purple text-white py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <a 
          href={projectsData.profile?.website || '#'}
          className="flex items-center gap-2 w-fit hover:opacity-90 transition-opacity"
        >
          <img 
            src="/logo.png" 
            alt="The Rama Dev" 
            className="w-8 h-8" 
          />
          <span className="text-xl font-semibold">therama.dev</span>
        </a>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
};

export default Header;
