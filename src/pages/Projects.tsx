
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { toast } from "sonner";
import { Github, Twitter, Linkedin, Facebook, Instagram, Youtube, Package } from 'lucide-react';
import projectsData from '../assets/projects.json';
import { getSocialLinks, getProjectStatuses, getProjects, type SocialLink, type ProjectStatus, type Project } from '@/services/staticApi';

// Using Project from the static API service (Supabase)
export type ProjectAPI = Project;

// Using ProjectStatus from the static API service (Supabase)
type StatusAPI = ProjectStatus;

const socialIcons = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  npm: Package,
} as const;

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
        const [projData, statusData, socialData] = await Promise.all([
          getProjects(),
          getProjectStatuses(),
          getSocialLinks(),
        ]);
        
        // Sort projects by order property, handling undefined orders
        const sortedProjects = [...projData].sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        
        // Map status.id -> status
        const statusMap: Record<string, StatusAPI> = {};
        statusData.forEach((s) => { 
          statusMap[s.id] = s; 
        });

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

  const featuredProject = projects[0];
  const remainingProjects = projects.slice(1);

  const renderSocialLinks = (footer = false) => (
    <div className={`flex items-center gap-2 ${footer ? '' : 'justify-end'}`}>
      {socialLinks.map((link) => {
        const Icon = socialIcons[link.platform as keyof typeof socialIcons];
        if (!Icon) return null;
        return (
          <a
            key={`${link.id}-${footer ? 'footer' : 'hero'}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-400 dark:hover:text-violet-300"
            aria-label={link.label}
          >
            <Icon size={17} aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0b16]">
      <Header />
      <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <section className="grid gap-8 border-b border-slate-200/80 pb-12 dark:border-slate-800/80 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
              Digital innovation lab / {new Date().getFullYear()}
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 dark:text-white sm:text-7xl">
              Serious software, built with curiosity.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              A living collection of applications exploring the intersection of code, creativity, and useful technology.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="text-sm text-slate-500 dark:text-slate-400">Connect with {developerName?.split(',')[0] || 'the creator'}</p>
            {socialLinks.length > 0 ? renderSocialLinks() : null}
          </div>
        </section>

        {featuredProject ? (
          <section className="pt-12" aria-labelledby="selected-work-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">01 / Selected work</p>
                <h2 id="selected-work-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">The work, in progress.</h2>
              </div>
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">{projects.length} projects in the collection</span>
            </div>
            <ProjectCard
              key={featuredProject.id}
              featured
              id={featuredProject.id}
              title={featuredProject.title}
              description={featuredProject.description}
              technologies={featuredProject.technologies}
              githubUrl={featuredProject.github_url}
              previewUrl={featuredProject.preview_url}
              images={{ web: featuredProject.image_web, mobile: featuredProject.image_mobile }}
              isPublic={featuredProject.is_public}
              readmeUrl={featuredProject.readme_url}
              version={featuredProject.current_version}
              statusName={statuses[featuredProject.status_id]?.name}
              statusClass={statuses[featuredProject.status_id]?.class}
              statusDescription={statuses[featuredProject.status_id]?.description}
              lastDeployedAt={featuredProject.last_deployed_at}
            />
          </section>
        ) : null}

        {remainingProjects.length > 0 ? (
          <section className="pt-16" aria-labelledby="archive-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">02 / More work</p>
                <h2 id="archive-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">More things made.</h2>
              </div>
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">Browse by project</span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {remainingProjects.map((project) => {
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
                    images={{ web: project.image_web, mobile: project.image_mobile }}
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
          </section>
        ) : null}
      </main>
      <footer className="border-t border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-950/50">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          {socialLinks.length > 0 ? renderSocialLinks(true) : <span />}
          <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
            <p>&copy; {new Date().getFullYear()} {developerName || 'therama.dev'}</p>
            <p className="mt-1">Built in public · MIT License</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Projects;
