import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { AdminModule } from './admin/admin.module';
import { RiderModule } from './rider/rider.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CustomerModule } from './customer/customer.module';

import { MongooseModule } from '@nestjs/mongoose';
import { UploadFileModule } from './upload-file/upload-file.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    UserModule,
    OrderModule,
    AdminModule,
    RiderModule,
    DashboardModule,
    CustomerModule,

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    UploadFileModule,
  ],
})
export class AppModule {}
