
import React, { useState } from 'react';
import { Github, EyeOff, ExternalLink, Clock, Info, Calendar, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReadmeDialog from './ReadmeDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import DeploymentHistoryDialog from './DeploymentHistoryDialog';
import StatusBadge from './StatusBadge';
import { useAssetUrl } from '@/hooks/useAssetUrl';

interface ProjectCardProps {
  featured?: boolean;
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  previewUrl: string;
  images: {
    web: string;
    mobile: string;
  };
  isPublic: boolean;
  readmeUrl: string;
  version: string;
  statusName?: string;
  statusClass?: string;
  statusDescription?: string;
  lastDeployedAt?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
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
}) => {
  const isMobile = useIsMobile();
  // Public URL for the image (web or mobile) in the Supabase "uploads" bucket
  const resolvedImageUrl = useAssetUrl(isMobile ? images.mobile : images.web);

  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showReadmeDialog, setShowReadmeDialog] = useState(false);

  const formattedDate = lastDeployedAt
    ? format(new Date(lastDeployedAt), 'MMM dd, yyyy h:mm a')
    : 'Not deployed yet';

  return (
    <Card className={`group relative flex h-full flex-col overflow-hidden border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-violet-500/40 ${featured ? 'lg:grid lg:grid-cols-[1.25fr_1fr]' : ''}`}>
      <CardHeader className={`p-4 pb-0 sm:p-5 ${featured ? 'lg:p-6' : ''}`}>
        <div className={`w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 ${featured ? 'aspect-[16/9] lg:aspect-auto lg:h-full' : 'aspect-video'}`}>
          {/* Grey background shows while the image loads */}
          <img
            src={resolvedImageUrl || ""}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ minHeight: 100 }}
          />
        </div>
        <div className={`mt-4 flex items-start justify-between gap-4 ${featured ? 'lg:hidden' : ''}`}>
          <h3 className={`${featured ? 'text-2xl sm:text-3xl' : 'text-xl'} font-semibold leading-tight tracking-[-0.03em] text-slate-950 dark:text-gray-100`}>{title}</h3>
          <div className="flex shrink-0 items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>v{version}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`flex flex-grow flex-col gap-0 p-4 pt-2 sm:p-5 sm:pt-3 ${featured ? 'lg:p-6' : ''}`}>
        {featured ? (
          <div className="mb-4 hidden items-start justify-between gap-4 lg:flex">
            <h3 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 dark:text-gray-100">{title}</h3>
            <div className="flex shrink-0 items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>v{version}</span>
            </div>
          </div>
        ) : null}
        {/* Always show StatusBadge right below title */}
        <StatusBadge
          statusName={statusName}
          statusClass={statusClass}
          statusDescription={statusDescription}
        />

        {/* Description w/ minimal space above and below */}
        <p
          className={`${featured ? 'text-base leading-7' : 'text-sm'} mt-2 line-clamp-3 text-slate-600 dark:text-slate-300`}
          title={description}
          style={{ minHeight: featured ? 70 : 40 }}
        >
          {description}
        </p>

        {/* Tech badges */}
        <div className="mb-3 mt-4 flex flex-wrap gap-1.5">
          {Array.isArray(technologies) && technologies.length > 0 ? (
            technologies.map(tech => (
              <span
                key={tech}
                className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-200"
              >
                {tech}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">No technologies listed</span>
          )}
        </div>

        {/* Deployed date info */}
        <div className="mb-4 mt-0 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3 w-3" />
          <span>Last deployed: {formattedDate}</span>
        </div>

        {/* Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* GitHub Button */}
          {isPublic ? (
            <Button
              variant="outline"
              size="sm"
              className="h-10 justify-center gap-1"
              onClick={() => window.open(githubUrl, '_blank')}
            >
              <Github className="h-4 w-4" />
              <span className="hidden md:inline">GitHub</span>
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 justify-center gap-1"
                    disabled
                  >
                    <EyeOff className="h-4 w-4" />
                    <span className="hidden md:inline">Private</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a private repository</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Preview Button */}
          <Button
            variant="default"
            size="sm"
            className="h-10 justify-center gap-1"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden md:inline">Preview</span>
          </Button>
          {/* README Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 justify-center gap-1"
            onClick={() => setShowReadmeDialog(true)}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">README</span>
          </Button>
          {/* Deployments Button */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 justify-center gap-1"
            onClick={() => setShowDeployDialog(true)}
          >
            <Info className="h-4 w-4" />
            <span className="hidden md:inline">Deployments</span>
          </Button>
        </div>
      </CardContent>
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
    </Card>
  );
};

export default ProjectCard;
