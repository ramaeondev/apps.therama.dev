import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';

const NotFound = () => (
  <AppShell>    <div className="flex flex-col items-start gap-6 py-16">
      <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action">
        <span className="h-4 w-px bg-action" aria-hidden="true" />
        Error 404
      </p>
      <h1 className="text-balance text-[clamp(2.25rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-ink">
        This page doesn&apos;t exist
      </h1>
      <p className="max-w-md text-pretty text-base leading-7 text-ink-muted">
        The link may be outdated, or the page may have moved. Everything else is still where you left it.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to overview
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/projects">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Browse repositories
          </Link>
        </Button>
      </div>
    </div>
  </AppShell>
);

export default NotFound;
