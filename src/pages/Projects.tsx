
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Monitor, Laptop } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Task Management App',
    description: 'A powerful task tracking and organization tool',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    icon: Book
  },
  {
    id: 2,
    title: 'Personal Portfolio',
    description: 'An elegant showcase of my web development skills',
    technologies: ['React', 'Shadcn UI', 'Tailwind'],
    icon: Laptop
  },
  {
    id: 3,
    title: 'Dashboard Application',
    description: 'Comprehensive analytics and data visualization platform',
    technologies: ['React', 'Recharts', 'React Query'],
    icon: Monitor
  }
  // Add more projects as you build them
];

const ProjectCard: React.FC<(typeof projects)[0]> = ({ 
  title, 
  description, 
  technologies,
  icon: Icon 
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 mr-4 text-vivid-purple" />
      <h3 className="text-xl font-bold text-dark-purple">{title}</h3>
    </div>
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
    <div className="mt-4">
      <Link 
        to="#" 
        className="bg-vivid-purple text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
      >
        View Project
      </Link>
    </div>
  </div>
);

const Projects = () => {
  return (
    <div className="min-h-screen bg-soft-gray p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-dark-purple mb-8 text-center">
          My Projects
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
