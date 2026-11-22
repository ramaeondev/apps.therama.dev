import { useState } from 'react';
import { CalendarDays, EyeOff, ExternalLink, FileText, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReadmeDialog from './ReadmeDialog';
import DeploymentHistoryDialog from './DeploymentHistoryDialog';
import StatusBadge from './StatusBadge';
import BrandIcon from './BrandIcon';
import { useAssetUrl } from '@/hooks/useAssetUrl';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface ProjectCardProps {
  featured?: boolean;
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  previewUrl: string;
  images: { web: string; mobile: string };
  isPublic: boolean;
  readmeUrl: string;
  version: string;
  statusName?: string;
  statusClass?: string;
  statusDescription?: string;
  lastDeployedAt?: string;
}

const ProjectCard = ({
  featured = false,
  id,
  title,
  description,
  technologies,
  githubUrl,
  previewUrl,
  images,
  isPublic,
  readmeUrl,
  version,
  statusName,
  statusClass,
  statusDescription,
  lastDeployedAt,
}: ProjectCardProps) => {
  const isMobile = useIsMobile();
  const resolvedImageUrl = useAssetUrl(isMobile ? images.mobile : images.web);

  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showReadmeDialog, setShowReadmeDialog] = useState(false);

  const techList = Array.isArray(technologies) ? technologies : [];

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface',
        'transition-[border-color,box-shadow,transform] duration-300 ease-smooth',
        'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.14)]',
        featured && 'lg:grid lg:grid-cols-[1.15fr_1fr]',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-surface-2',
          featured ? 'aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[22rem]' : 'aspect-[16/10]',
        )}
      >
        {resolvedImageUrl ? (
          <img
            src={resolvedImageUrl}
            alt={`${title} interface preview`}
            loading={featured ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
            No preview available
          </div>
        )}
        <span className="tabular absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[0.65rem] font-medium text-white backdrop-blur-sm">
          v{version}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              'text-pretty font-semibold leading-tight tracking-[-0.02em] text-ink',
              featured ? 'text-2xl sm:text-[1.75rem]' : 'text-lg',
            )}
          >
            {title}
          </h3>
          <StatusBadge
            statusName={statusName}
            statusClass={statusClass}
            statusDescription={statusDescription}
            className="mt-1 shrink-0"
          />
        </div>

        <p
          className={cn(
            'mt-2.5 line-clamp-3 text-pretty leading-6 text-ink-muted',
            featured ? 'text-[0.95rem]' : 'text-sm',
          )}
          title={description}
        >
          {description}
        </p>

        {techList.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {techList.map((tech) => (
              <li
                key={tech}
                className="rounded-md bg-surface-2 px-2 py-0.5 text-[0.7rem] font-medium text-ink-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-ink-faint">No technologies listed</p>
        )}

        <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-faint">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Deployed <time dateTime={lastDeployedAt}>{formatRelative(lastDeployedAt)}</time>
          </span>
        </p>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5 sm:grid-cols-4">
          {isPublic ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-2"
              onClick={() => window.open(githubUrl, '_blank', 'noopener,noreferrer')}
            >
              <BrandIcon brand="github" size={15} />
              <span className="sr-only sm:not-sr-only">Code</span>
            </Button>
          ) : (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 px-2" disabled>
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">Private</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>This is a private repository</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            variant="default"
            size="sm"
            className="h-9 gap-1.5 px-2"
            onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Live</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 px-2"
            onClick={() => setShowReadmeDialog(true)}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Readme</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 px-2"
            onClick={() => setShowDeployDialog(true)}
          >
            <History className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">History</span>
          </Button>
        </div>
      </div>

      <ReadmeDialog
        title={title}
        readmeUrl={readmeUrl}
        open={showReadmeDialog}
        onOpenChange={setShowReadmeDialog}
      />
      <DeploymentHistoryDialog
        title={title}
        projectId={id}
        open={showDeployDialog}
        onOpenChange={setShowDeployDialog}
      />
    </article>
  );
};

export default ProjectCard;
