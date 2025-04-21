
import React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';
import projectsData from '../assets/projects.json';
import ProjectCard from '@/components/ProjectCard';
import Header from '@/components/Header';

const SocialLinks: React.FC = () => {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center gap-4 mt-4">
      {projectsData.profile.socialLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-dark-purple hover:text-vivid-purple transition-colors"
          aria-label={link.label}
        >
          {getSocialIcon(link.platform)}
        </a>
      ))}
    </div>
  );
};

const Projects = () => {
  return (
    <div className="min-h-screen bg-soft-gray">
      <Header />
      <div className="container mx-auto px-4 sm:px-8 py-8">
        <div className="text-center py-12 bg-soft-purple rounded-lg shadow-md mb-8">
          <h1 className="text-4xl font-bold text-dark-purple mb-4">
            {projectsData.profile.name}
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            {projectsData.profile.title}
          </p>
          <SocialLinks />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
