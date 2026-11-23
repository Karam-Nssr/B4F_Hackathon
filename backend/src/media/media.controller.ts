import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { InjectDisk, serveFile, StorageDisk } from '@nestjs/storage';
import type { Request, Response } from 'express';
import { AVATARS_DISK } from '../storage/storage.config.js';

/**
 * Serves uploaded avatars. In production a CDN fronts the photos bucket
 * instead; this route only backs the local disk during development.
 * Keys are random UUIDs handed out by the upload endpoint, so a guessable
 * name is not a concern — `serveFile` still rejects anything that is not a
 * plain key on the disk.
 */
@Controller('media')
export class MediaController {
  constructor(@InjectDisk(AVATARS_DISK) private readonly avatars: StorageDisk) {}

  @Get('avatars/:file')
  serve(
    @Param('file') file: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return serveFile(this.avatars, file, { req, res, disposition: 'inline' });
  }
}
