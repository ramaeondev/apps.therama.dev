import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ExternalLink, FolderOpen, Package } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import SectionHeading from '@/components/layout/SectionHeading';
import StatePanel from '@/components/layout/StatePanel';
import MetricCard from '@/components/layout/MetricCard';
import ProjectCard from '@/components/ProjectCard';
import BrandIcon, { type BrandName } from '@/components/BrandIcon';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getProjects,
  getProjectStatuses,
  getSocialLinks,
  type Project,
  type ProjectStatus,
  type SocialLink,
} from '@/services/staticApi';
import { queryKeys } from '@/services/operationsApi';
import { formatRate } from '@/lib/format';
import projectsData from '@/assets/projects.json';

const SOCIAL_BRANDS: Record<string, BrandName> = {
  github: 'github',
  twitter: 'twitter',
  linkedin: 'linkedin',
  facebook: 'facebook',
  instagram: 'instagram',
  youtube: 'youtube',
  npm: 'npm',
};

const SocialLinks = ({ links, footer = false }: { links: SocialLink[]; footer?: boolean }) => (
  <ul className={footer ? 'flex items-center gap-2' : 'flex items-center gap-2 sm:justify-end'}>
    {links.map((link) => {
      const brand = SOCIAL_BRANDS[link.platform?.toLowerCase()];
      if (!brand) return null;
      return (
        <li key={`${link.id}-${footer ? 'footer' : 'hero'}`}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors duration-200 hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandIcon brand={brand} size={17} />
          </a>
        </li>
      );
    })}
  </ul>
);

const PortfolioSkeleton = () => (
  <div aria-busy="true" aria-live="polite">
    <span className="sr-only">Loading projects…</span>
    <div className="border-b border-line pb-8">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-5 h-12 w-full max-w-2xl" />
      <Skeleton className="mt-3 h-12 w-full max-w-xl" />
      <Skeleton className="mt-5 h-4 w-full max-w-lg" />
    </div>
    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
    <Skeleton className="mt-10 h-72 rounded-xl" />
    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-80 rounded-xl" />
      ))}
    </div>
  </div>
);

const Portfolio = () => {
  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: getProjects,
    staleTime: 5 * 60_000,
  });
  const statusesQuery = useQuery({
    queryKey: queryKeys.projectStatuses,
    queryFn: getProjectStatuses,
    staleTime: 10 * 60_000,
  });
  const socialQuery = useQuery({
    queryKey: queryKeys.socialLinks,
    queryFn: getSocialLinks,
    staleTime: 10 * 60_000,
  });

  const projects = projectsQuery.data ?? [];
  const statuses: ProjectStatus[] = statusesQuery.data ?? [];
  const socialLinks: SocialLink[] = socialQuery.data ?? [];
  const profile = projectsData.profile;

  /** Fill in status fields when the nested join is absent. */
  const statusFor = (project: Project) =>
    statuses.find((status) => status.id === project.status_id);

  const featured = projects[0];
  const archive = projects.slice(1);
  const publicCount = projects.filter((project) => project.is_public).length;

  return (
    <AppShell
      footer={
        <footer className="mt-16 border-t border-line bg-surface">
          <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <div>
              <p className="text-sm font-semibold text-ink">{profile?.name ?? 'therama.dev'}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Built and maintained by{' '}
                <a
                  href={profile?.website ?? 'https://therama.dev'}
                  className="text-action hover:underline"
                >
                  therama.dev
                </a>
              </p>
            </div>
            {socialLinks.length > 0 ? <SocialLinks links={socialLinks} footer /> : null}
          </div>
        </footer>
      }
    >
      {projectsQuery.isLoading ? (
        <PortfolioSkeleton />
      ) : projectsQuery.isError ? (
        <StatePanel
          tone="danger"
          icon={<AlertCircle className="h-5 w-5" />}
          title="Projects could not be loaded"
          description="The portfolio service did not respond. This is usually temporary — retry in a moment."
          action={
            <Button variant="outline" onClick={() => void projectsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <section className="border-b border-line pb-10">
            <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
              <div>
                <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action">
                  <span className="h-4 w-px bg-action" aria-hidden="true" />
                  Portfolio
                </p>
                <h1 className="mt-4 text-balance text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
                  {profile?.name ?? 'therama.dev'}
                </h1>
                <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
                  {profile?.title ??
                    'Production web systems, built end to end — from the data layer through to the interface.'}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg">
                    <a href={profile?.website ?? 'https://therama.dev'}>
                      Visit main site
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="#archive">Browse {projects.length} projects</a>
                  </Button>
                </div>
              </div>

              {socialLinks.length > 0 ? (
                <div className="lg:text-right">
                  <p className="mb-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                    Elsewhere
                  </p>
                  <SocialLinks links={socialLinks} />
                </div>
              ) : null}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard
                label="Projects"
                value={projects.length}
                tone="action"
                icon={<FolderOpen className="h-4 w-4" />}
              />
              <MetricCard label="Public" value={publicCount} tone="success" />
              <MetricCard label="Private" value={projects.length - publicCount} tone="neutral" />
              <MetricCard
                label="Open source"
                value={formatRate(publicCount, projects.length)}
                tone="info"
                detail="Share of repositories visible publicly"
              />
            </div>
          </section>


          {featured ? (
            <section className="mt-12" aria-labelledby="featured-heading">
              <SectionHeading
                index="01 / Featured"
                id="featured-heading"
                title="Most recent release"
                description="The project deployed most recently, shown in full."
              />
              <div className="mt-6">
                <ProjectCard
                  featured
                  id={featured.id}
                  title={featured.title}
                  description={featured.description}
                  technologies={featured.technologies}
                  githubUrl={featured.github_url}
                  previewUrl={featured.preview_url}
                  images={{ web: featured.image_web, mobile: featured.image_mobile }}
                  isPublic={featured.is_public}
                  readmeUrl={featured.readme_url}
                  version={featured.current_version}
                  statusName={featured.status_name ?? statusFor(featured)?.name}
                  statusClass={featured.status_class ?? statusFor(featured)?.class}
                  statusDescription={featured.status_description ?? statusFor(featured)?.description}
                  lastDeployedAt={featured.last_deployed_at}
                />
              </div>
            </section>
          ) : null}

          <section id="archive" className="mt-14 scroll-mt-24" aria-labelledby="archive-heading">
            <SectionHeading
              index="02 / Archive"
              id="archive-heading"
              title="All projects"
              description="Everything I maintain, with live status and deployment history."
              aside={
                <span className="tabular rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
                  {projects.length} total
                </span>
              }
            />
            {archive.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {archive.map((project) => (
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
                    statusName={project.status_name ?? statusFor(project)?.name}
                    statusClass={project.status_class ?? statusFor(project)?.class}
                    statusDescription={project.status_description ?? statusFor(project)?.description}
                    lastDeployedAt={project.last_deployed_at}
                  />
                ))}
              </div>
            ) : (
              <StatePanel
                className="mt-6"
                icon={<Package className="h-5 w-5" />}
                title="No other projects yet"
                description="This is the only project published so far."
              />
            )}
          </section>
        </>
      )}
    </AppShell>
  );
};

export default Portfolio;

