import { join } from 'node:path';
import { LocalDisk, type StorageModuleOptions } from '@nestjs/storage';

/** Named disk that holds uploaded profile photos. */
export const AVATARS_DISK = 'avatars';

/** Public URL prefix for avatars (the app's global `api` prefix included). */
export const AVATAR_PUBLIC_PREFIX = '/api/media/avatars';

/** JPEG / PNG / WebP only — checked from the file's bytes, never the claim. */
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MiB
/** Every avatar gets a fresh UUID key, so caches may keep it forever. */
export const AVATAR_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/** Where an avatar key lives in the public URL space. */
export const avatarPublicUrl = (key: string) => `${AVATAR_PUBLIC_PREFIX}/${key}`;

/** Local disk in development; swap the factory for S3 in production. */
export function createStorageOptions(): StorageModuleOptions {
  return {
    default: AVATARS_DISK,
    disks: {
      [AVATARS_DISK]: new LocalDisk({
        root: join(import.meta.dirname, '..', '..', 'storage', 'avatars'),
      }),
    },
  };
}
