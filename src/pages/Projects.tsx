
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { toast } from "sonner";
import { Github, Twitter, Linkedin } from 'lucide-react';
import projectsData from '../assets/projects.json';

interface ProjectAPI {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github_url: string;
  preview_url: string;
  image_web: string;
  image_mobile: string;
  status_id: string;
  current_version: string;
  is_public: boolean;
  readme_url: string;
  order: number;
  last_deployed_at?: string;
}

interface StatusAPI {
  id: string;
  name: string;
  description: string;
  class: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  created_at: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectAPI[]>([]);
  const [statuses, setStatuses] = useState<Record<string, StatusAPI>>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const developerName = projectsData.profile?.name;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [projRes, statusRes, socialRes] = await Promise.all([
          fetch('https://api.therama.dev/functions/v1/get-projects'),
          fetch('https://api.therama.dev/functions/v1/get-project-statuses'),
          fetch('https://api.therama.dev/functions/v1/get-social-links'),
        ]);
        
        const projData: ProjectAPI[] = await projRes.json();
        
        // Sort projects by order property, handling undefined orders
        const sortedProjects = [...projData].sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        
        const statusRaw = await statusRes.json();
        const statusArr: StatusAPI[] = statusRaw.statuses || [];
        
        // Map status.id -> status
        const statusMap: Record<string, StatusAPI> = {};
        statusArr.forEach((s) => { statusMap[s.id] = s; });
        
        // Parse social links response
        let socialData: SocialLink[] = [];
        try {
          const socialRaw = await socialRes.json();
          // Check if the response has a links property
          if (socialRaw && socialRaw.links && Array.isArray(socialRaw.links)) {
            socialData = socialRaw.links;
          } else if (Array.isArray(socialRaw)) {
            socialData = socialRaw;
          }
        } catch (error) {
          console.error('Error parsing social links:', error);
          socialData = [];
        }

        setProjects(sortedProjects);
        setStatuses(statusMap);
        setSocialLinks(socialData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray dark:bg-gray-900">
        <span className="text-2xl text-dark-purple dark:text-white">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gray dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="container mx-auto px-4 sm:px-8 py-8">
        <div className="text-center py-10 bg-soft-purple dark:bg-dark-purple rounded-lg shadow-md mb-8 transition-colors duration-200">
          <h1 className="text-4xl font-bold text-dark-purple dark:text-white mb-4">
              Digital Innovation Lab
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Exploring the intersection of code, creativity, and cutting-edge technology.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            {Array.isArray(socialLinks) && socialLinks.length > 0 && socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-purple dark:text-white hover:text-vivid-purple dark:hover:text-vivid-purple transition-colors"
                aria-label={link.label}
              >
                {link.platform === 'github' && <Github size={24} />}
                {link.platform === 'twitter' && <Twitter size={24} />}
                {link.platform === 'linkedin' && <Linkedin size={24} />}
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const statusObj = statuses[project.status_id];
            return (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                technologies={project.technologies}
                githubUrl={project.github_url}
                previewUrl={project.preview_url}
                images={{
                  web: project.image_web,
                  mobile: project.image_mobile
                }}
                isPublic={project.is_public}
                readmeUrl={project.readme_url}
                version={project.current_version}
                statusName={statusObj?.name}
                statusClass={statusObj?.class}
                statusDescription={statusObj?.description}
                lastDeployedAt={project.last_deployed_at}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Projects;
