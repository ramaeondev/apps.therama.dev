import { useMemo } from 'react';
import { assetUrl, storageAssetUrl } from '@/services/staticApi';

/**
 * Public URL for a project asset (screenshot or README) on the CDN
 * (https://cdn.therama.dev/apps/...). Built directly, no network call needed.
 */
export function useAssetUrl(path: string): string | null {
  return useMemo(() => assetUrl(path), [path]);
}

/** Supabase Storage copy of the same asset, used as a fallback. */
export function useStorageAssetUrl(path: string): string | null {
  return useMemo(() => storageAssetUrl(path), [path]);
}
