import { Response,Controller,  UseInterceptors,UploadedFile,Post } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileService } from './upload-file.service';

@Controller('upload')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@Response() res,@UploadedFile() image:Express.Multer.File) {
      return this.uploadFileService.uploadImage(image,res);
  }
}
