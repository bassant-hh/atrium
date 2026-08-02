import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { UploadFileController } from './upload-file.controller';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [MulterModule.register({
      storage: diskStorage({
          destination: './uploads',
          filename: (req,file,cb) => {
              cb(null,Date.now()+'.'+file.originalname);
          }
      })
  })],
  controllers: [UploadFileController],
  providers: [UploadFileService],
})
export class UploadFileModule {}
