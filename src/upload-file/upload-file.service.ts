import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadFileService {
    uploadImage(image: Express.Multer.File,res:any) {
        if( !image ) {
            return res.status(400).send({status: 400,message: "Invalid File"});
        }

        if( ['image/png','image/jpeg'].indexOf(image.mimetype) == -1 ) {
            return res.status(400).send({status: 400,message: "Invalid File Type"});
        }

        if( image.size >= 1024 * 1024 * 2 ) {
            return res.status(400).send({status: 400,message: "Very Big File"});
        }
        
        return {status: 200,message: "Image Uploaded",data: image.path};
    }
}
