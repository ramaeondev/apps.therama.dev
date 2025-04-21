
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';

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
      const [projRes, statusRes, socialRes] = await Promise.all([
        fetch('https://api.therama.dev/functions/v1/get-projects'),
        fetch('https://api.therama.dev/functions/v1/get-project-statuses'),
        fetch('https://api.therama.dev/functions/v1/get-social-links'),
      ]);
      const projData: ProjectAPI[] = await projRes.json();
      const statusRaw = await statusRes.json();
      const statusArr: StatusAPI[] = statusRaw.statuses || [];
      const socialData: SocialLink[] = await socialRes.json();
      
      // Map status.id -> status
      const statusMap: Record<string, StatusAPI> = {};
      statusArr.forEach((s) => { statusMap[s.id] = s; });

      setProjects(projData);
      setStatuses(statusMap);
      setSocialLinks(socialData);
      setLoading(false);
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
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-purple hover:text-vivid-purple transition-colors"
                aria-label={link.label}
              >
                {link.platform === 'github' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /></svg>
                )}
                {link.platform === 'twitter' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                )}
                {link.platform === 'linkedin' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                )}
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
