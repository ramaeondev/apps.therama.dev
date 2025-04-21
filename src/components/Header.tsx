
import React from 'react';
import projectsData from '../assets/projects.json';

const Header = () => {
  return (
    <header className="bg-dark-purple text-white py-4 px-6">
      <div className="container mx-auto">
        <a 
          href={projectsData.profile?.website || '#'}
          className="flex items-center gap-2 w-fit hover:opacity-90 transition-opacity"
        >
          <img 
            src="/lovable-uploads/1d25954a-c658-4965-9d10-75cc74c96885.png" 
            alt="The Rama Dev" 
            className="w-8 h-8" 
          />
          <span className="text-xl font-semibold">therama.dev</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
