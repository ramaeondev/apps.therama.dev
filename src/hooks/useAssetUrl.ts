import { useMemo } from 'react';
import { assetUrl } from '@/services/staticApi';

/**
 * Public URL for a project asset (screenshot or README) stored in the "uploads" bucket
 * on the therama.dev Supabase backend. Replaces the old get-s3-file lookup: the URL is
 * built directly, no network call needed.
 */
export function useAssetUrl(path: string): string | null {
  return useMemo(() => assetUrl(path), [path]);
}
