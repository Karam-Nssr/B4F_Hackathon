import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import {
  LocalDisk,
  uploadToDisk,
  type StorageModuleOptions,
  type UploadFileInfo,
} from '@nestjs/storage';

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

/** Multipart field the profile photo arrives in. */
export const PHOTO_FIELD = 'photo';

/**
 * Multer options for `PATCH /users/me/photo`: the type is decided from the file's bytes
 * (JPEG / PNG / WebP only, else 415), anything over 5 MiB is a 413 with nothing written,
 * and every photo gets a fresh UUID key so it may be cached forever.
 */
export function avatarUploadOptions() {
  return {
    storage: uploadToDisk({
      disk: AVATARS_DISK,
      contentTypes: AVATAR_TYPES,
      cacheControl: AVATAR_CACHE_CONTROL,
      key: (file: UploadFileInfo) => `${randomUUID()}${file.extension}`,
    }),
    limits: { fileSize: MAX_AVATAR_SIZE, files: 1 },
  };
}

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
