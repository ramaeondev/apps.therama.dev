// Read-only access to public reference data on the self-hosted Supabase backend
// (schema "static" at https://api-v3.therama.dev). No login needed.
// The publishable key is meant to be public; the backend only allows SELECT on this schema.

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://api-v3.therama.dev';
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  'sb_publishable_TvfycUXoZ1whU1e-L8qhH-_PwN2YmxB';

async function selectStatic<T>(table: string, query: string): Promise<T[]> {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?${query}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Accept-Profile': 'static',
    },
  });
  if (!response.ok) {
    throw new Error(`API error (static.${table}): ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Social links

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  created_at: string;
}

interface SocialLinkRow {
  id: string;
  platform: string;
  url: string;
  display_name: string;
  created_at: string;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const rows = await selectStatic<SocialLinkRow>(
      'social_links',
      'select=id,platform,url,display_name,created_at&is_active=eq.true&order=sort_order.asc',
    );
    return rows.map((r) => ({
      id: r.id,
      platform: r.platform,
      url: r.url,
      label: r.display_name,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error('Error fetching social links:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Project statuses

export interface ProjectStatus {
  id: string;
  name: string;
  description: string;
  class: string;
}

export async function getProjectStatuses(): Promise<ProjectStatus[]> {
  try {
    const rows = await selectStatic<{ id: string; name: string; description: string | null; class: string | null }>(
      'project_statuses',
      'select=id,name,description,class',
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? '',
      class: r.class ?? '',
    }));
  } catch (error) {
    console.error('Error fetching project statuses:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Projects

export interface Project {
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
  status_name?: string;
  status_class?: string;
  status_description?: string;
}

interface ProjectRow {
  id: string;
  title: string;
  description: string | null;
  technologies: string[] | null;
  github_url: string | null;
  preview_url: string | null;
  image_web: string | null;
  image_mobile: string | null;
  status_id: string;
  current_version: string | null;
  is_public: boolean;
  readme_url: string | null;
  sort_order: number;
  last_deployed_at: string | null;
  project_statuses: { name: string; class: string | null; description: string | null } | null;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const rows = await selectStatic<ProjectRow>(
      'projects',
      'select=id,title,description,technologies,github_url,preview_url,image_web,image_mobile,status_id,' +
        'current_version,is_public,readme_url,sort_order,last_deployed_at,' +
        'project_statuses(name,class,description)&order=sort_order.asc',
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? '',
      technologies: r.technologies ?? [],
      github_url: r.github_url ?? '',
      preview_url: r.preview_url ?? '',
      image_web: r.image_web ?? '',
      image_mobile: r.image_mobile ?? '',
      status_id: r.status_id,
      current_version: r.current_version ?? '',
      is_public: r.is_public,
      readme_url: r.readme_url ?? '',
      order: r.sort_order,
      last_deployed_at: r.last_deployed_at ?? undefined,
      status_name: r.project_statuses?.name,
      status_class: r.project_statuses?.class ?? undefined,
      status_description: r.project_statuses?.description ?? undefined,
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export default {
  getSocialLinks,
  getProjectStatuses,
  getProjects,
};

// ---------------------------------------------------------------------------
// Public files (project screenshots, READMEs). Served from the Cloudflare R2 CDN
// (https://cdn.therama.dev/apps/...), copied there from the Supabase Storage bucket
// "uploads", which stays available as a fallback.
// Paths are stored relative, e.g. "images/apps-therama-dev-large.png" or "readme/apps.therama.dev.md".

export const CDN_BASE = ((import.meta.env.VITE_CDN_BASE_URL as string | undefined) ?? 'https://cdn.therama.dev/apps').replace(/\/$/, '');

function cleanPath(path: string): string {
  return path.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/+/, '');
}

const encodePath = (p: string) => p.split('/').map(encodeURIComponent).join('/');

/** CDN URL for a project asset (screenshot or README). */
export function assetUrl(path: string): string | null {
  if (!path) return null;
  return `${CDN_BASE}/${encodePath(cleanPath(path))}`;
}

/** Same asset in Supabase Storage: fallback when the CDN can't be reached (or CORS blocks a fetch). */
export function storageAssetUrl(path: string): string | null {
  if (!path) return null;
  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/uploads/${encodePath(cleanPath(path))}`;
}
