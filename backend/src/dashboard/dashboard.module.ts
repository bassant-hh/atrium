import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../order/order.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import {
  DutySession,
  DutySessionSchema,
} from '../rider/schemas/duty-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: DutySession.name, schema: DutySessionSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
