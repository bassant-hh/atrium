import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const ALLOWED_MIMETYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_SIZE_BYTES = 1024 * 1024 * 2; // 2 MB

@Injectable()
export class UploadFileService {
  async uploadIds(
    front: Express.Multer.File | undefined,
    back: Express.Multer.File | undefined,
    res: Response,
  ) {
    if (!front || !back) {
      return res.status(400).send({
        status: 400,
        message: 'Both idFront and idBack files are required.',
      });
    }

    if (
      !ALLOWED_MIMETYPES.includes(front.mimetype) ||
      !ALLOWED_MIMETYPES.includes(back.mimetype)
    ) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid File Type. Only PNG and JPEG are accepted.',
      });
    }

    if (front.size >= MAX_SIZE_BYTES || back.size >= MAX_SIZE_BYTES) {
      return res.status(400).send({
        status: 400,
        message: 'File too large. Maximum size is 2 MB per image.',
      });
    }

    const id = randomUUID();
    const frontExt = extname(front.originalname) || '.jpg';
    const backExt = extname(back.originalname) || '.jpg';

    const [frontBlob, backBlob] = await Promise.all([
      put(`id-verification/${id}-front${frontExt}`, front.buffer, {
        access: 'private',
        contentType: front.mimetype,
      }),
      put(`id-verification/${id}-back${backExt}`, back.buffer, {
        access: 'private',
        contentType: back.mimetype,
      }),
    ]);

    return res.status(200).send({
      frontUrl: frontBlob.url,
      backUrl: backBlob.url,
    });
  }
}
