import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';

import { DutySession, DutySessionSchema } from './schemas/duty-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DutySession.name, schema: DutySessionSchema },
    ]),
  ],
  controllers: [RiderController],
  providers: [RiderService],
  exports: [RiderService, MongooseModule],
})
export class RiderModule {}
