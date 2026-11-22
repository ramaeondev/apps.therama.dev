import { useQuery } from '@tanstack/react-query';
import { AlertCircle, FileText, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssetUrl, useStorageAssetUrl } from '@/hooks/useAssetUrl';

interface ReadmeDialogProps {
  title: string;
  readmeUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Fetch the README from the CDN, falling back to Supabase Storage when the CDN
 * is unreachable or blocks the request with CORS.
 */
async function fetchReadme(urls: (string | null)[]): Promise<string> {
  for (const url of urls) {
    if (!url) continue;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      console.warn(`README not loaded from ${url}`, error);
    }
  }
  throw new Error('README could not be loaded from any source');
}

const ReadmeDialog = ({ title, readmeUrl, open, onOpenChange }: ReadmeDialogProps) => {
  // Strip any origin so only the storage path remains.
  const cleanReadmeUrl = readmeUrl.replace(/^https?:\/\/[^/]+\//, '');
  const cdnUrl = useAssetUrl(cleanReadmeUrl);
  const fallbackUrl = useStorageAssetUrl(cleanReadmeUrl);

  const readmeQuery = useQuery({
    queryKey: ['readme', cleanReadmeUrl],
    queryFn: () => fetchReadme([cdnUrl, fallbackUrl]),
    enabled: open && Boolean(cleanReadmeUrl),
    staleTime: 10 * 60_000,
    retry: 0,
  });

  const content = readmeQuery.data ?? '';
  const isLoading = readmeQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-pretty">{title} — README</DialogTitle>
          <DialogDescription>Fetched live from the project&apos;s repository.</DialogDescription>
        </DialogHeader>

        <div className="-mx-1 min-h-[12rem] overflow-y-auto rounded-lg border border-line bg-surface-2/40 px-4 py-4">
          {isLoading ? (
            <div className="space-y-2.5" aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading README…</span>
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ) : readmeQuery.isError ? (
            <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-ink">README unavailable</p>
              <p className="max-w-sm text-xs leading-5 text-ink-muted">
                The file could not be loaded from storage right now.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void readmeQuery.refetch()}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : content.trim() ? (
            <pre className="whitespace-pre-wrap break-words font-mono text-[0.78rem] leading-6 text-ink">
              {content}
            </pre>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileText className="h-5 w-5 text-ink-faint" aria-hidden="true" />
              <p className="text-sm text-ink-muted">No README content available.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadmeDialog;
