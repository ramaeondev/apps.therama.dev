
import React from 'react';
import { Code2 } from 'lucide-react';
import projectsData from '../assets/projects.json';

const Header = () => {
  return (
    <header className="bg-dark-purple text-white py-4 px-6">
      <div className="container mx-auto">
        <a 
          href={projectsData.profile.website}
          className="flex items-center gap-2 w-fit hover:opacity-90 transition-opacity"
        >
          <Code2 className="w-6 h-6" />
          <span className="text-xl font-semibold">therama.dev</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
