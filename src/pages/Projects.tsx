
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { toast } from "sonner";
import { Github, Twitter, Linkedin } from 'lucide-react';

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
        
        const statusRaw = await statusRes.json();
        const statusArr: StatusAPI[] = statusRaw.statuses || [];
        
        // Map status.id -> status
        const statusMap: Record<string, StatusAPI> = {};
        statusArr.forEach((s) => { statusMap[s.id] = s; });
        
        // Parse social links response
        let socialData: SocialLink[] = [];
        try {
          const socialRaw = await socialRes.json();
          // Check if the response has a links property (from the updated API)
          if (socialRaw && socialRaw.links && Array.isArray(socialRaw.links)) {
            socialData = socialRaw.links;
          } else if (Array.isArray(socialRaw)) {
            socialData = socialRaw;
          }
        } catch (error) {
          console.error('Error parsing social links:', error);
          socialData = [];
        }

        setProjects(projData);
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
      <div className="min-h-screen flex items-center justify-center bg-soft-gray">
        <span className="text-2xl text-dark-purple">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gray">
      <Header />
      <div className="container mx-auto px-4 sm:px-8 py-8">
        <div className="text-center py-12 bg-soft-purple rounded-lg shadow-md mb-8">
          <h1 className="text-4xl font-bold text-dark-purple mb-4">
            My Project Showcase
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            All side-project applications and experiments
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            {socialLinks && socialLinks.length > 0 && socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-purple hover:text-vivid-purple transition-colors"
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
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Projects;
