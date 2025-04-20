import React from 'react';
import { ExternalLink, Github, Linkedin, Twitter } from 'lucide-react';
import projectsData from '../assets/projects.json';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Header';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  previewUrl: string;
  images: {
    web: string;
    mobile: string;
  };
}

const ProjectCard: React.FC<Project> = ({ 
  title, 
  description, 
  technologies,
  githubUrl,
  previewUrl,
  images
}) => {
  const isMobile = useIsMobile();
  const imageUrl = isMobile ? images.mobile : images.web;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-xl font-bold text-dark-purple">{title}</h3>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span 
              key={tech} 
              className="bg-soft-purple text-vivid-purple px-2 py-1 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open(githubUrl, '_blank')}
        >
          <Github className="w-4 h-4 mr-2" />
          GitHub
        </Button>
        <Button
          variant="default"
          className="flex-1"
          onClick={() => window.open(previewUrl, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </CardFooter>
    </Card>
  );
};

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
      <div className="container mx-auto px-4 sm:px-8">
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
