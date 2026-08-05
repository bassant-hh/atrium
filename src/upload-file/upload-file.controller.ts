import {
  Response,
  Controller,
  UseInterceptors,
  UploadedFiles,
  Post,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadFileService } from './upload-file.service';
import type { Response as ExpressResponse } from 'express';

@Controller('upload')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Post('image')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idFront', maxCount: 1 },
      { name: 'idBack', maxCount: 1 },
    ]),
  )
  uploadImage(
    @Response() res: ExpressResponse,
    @UploadedFiles()
    files: {
      idFront?: Express.Multer.File[];
      idBack?: Express.Multer.File[];
    },
  ) {
    const front = files?.idFront?.[0];
    const back = files?.idBack?.[0];
    return this.uploadFileService.uploadIds(front, back, res);
  }
}
