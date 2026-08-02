import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';

import { MongooseModule } from '@nestjs/mongoose';
import { UploadFileModule } from './upload-file/upload-file.module';

@Module({
  imports: [UserModule, OrderModule,MongooseModule.forRoot('mongodb://root:PKk32H6NFfl6wKf1@ac-ug0cr7s-shard-00-00.3vrojug.mongodb.net:27017,ac-ug0cr7s-shard-00-01.3vrojug.mongodb.net:27017,ac-ug0cr7s-shard-00-02.3vrojug.mongodb.net:27017/makok?ssl=true&replicaSet=atlas-mrk13z-shard-0&authSource=admin&appName=Cluster0'), UploadFileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
