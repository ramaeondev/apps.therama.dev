
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';
import projectsData from '../assets/projects.json';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProjectCard: React.FC<(typeof projectsData.projects)[0]> = ({ 
  title, 
  description, 
  technologies,
  githubUrl,
  previewUrl,
  imageUrl
}) => (
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

const Projects = () => {
  return (
    <div className="min-h-screen bg-soft-gray p-4 sm:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-dark-purple mb-8 text-center">
          My Projects
        </h1>
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
