
import React, { useState } from 'react';
import { Github, EyeOff, ExternalLink, Clock, Info, Calendar, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReadmeDialog from './ReadmeDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import DeploymentHistoryDialog from './DeploymentHistoryDialog';

interface ProjectCardProps {
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
  const imageUrl = isMobile ? images.mobile : images.web;
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showReadmeDialog, setShowReadmeDialog] = useState(false);

  const formattedDate = lastDeployedAt 
    ? format(new Date(lastDeployedAt), 'MMM dd, yyyy h:mm a')
    : 'Not deployed yet';

  // Description height variables
  // 3 lines at most, ~22px per line, safe with minHeight 66px (could be tweaked)
  const descriptionMinHeight = "66px";

  return (
    <Card className="flex flex-col h-full relative overflow-hidden hover:shadow-md transition-all">
      <CardHeader className="p-4 pb-2">
        <div className="aspect-video w-full overflow-hidden rounded-lg mb-3">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-dark-purple dark:text-gray-100">{title}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>v{version}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0 flex flex-col">
        {/* Project status, INSIDE card, above deployment */}
        {statusName && statusClass && (
          <span
            className={`mb-2 text-white text-xs px-3 py-1 rounded-full inline-block max-w-fit font-semibold ${statusClass}`}
            title={statusDescription}
            style={{ marginBottom: "8px" }}
          >
            {statusName}
          </span>
        )}
        {/* Project description: fixed min/max height for uniform cards */}
        <p
          className="text-gray-600 dark:text-gray-300 mb-3 text-sm"
          style={{
            minHeight: descriptionMinHeight,
            maxHeight: descriptionMinHeight,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}
          title={description}
        >
          {description}
        </p>
        {/* Tech badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {technologies.map(tech => (
            <span
              key={tech}
              className="bg-soft-purple text-vivid-purple dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Calendar className="h-3 w-3" />
          <span>Last deployed: {formattedDate}</span>
        </div>
        <div className="flex gap-2 mt-auto">
          {/* GitHub Button */}
          {isPublic ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 justify-center gap-1"
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
                    className="flex-1 h-8 justify-center gap-1"
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
            className="flex-1 h-8 justify-center gap-1"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden md:inline">Preview</span>
          </Button>
          {/* README Button */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 justify-center gap-1"
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
