import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './customer.schema';
import { Order, OrderSchema } from '../order/order.schema';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerOrderController } from './customer-order.controller';
import { CustomerOrderService } from './customer-order.service';
import { CustomerDestinationController } from './customer-destination.controller';
import { CustomerDestinationService } from './customer-destination.service';
import { LocationIqProvider } from './providers/locationiq.provider';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';
import { RealtimeModule } from '../realtime/realtime.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    RealtimeModule,
    PaymentModule,
  ],
  controllers: [
    CustomerController,
    CustomerOrderController,
    CustomerDestinationController,
  ],
  providers: [
    CustomerService,
    CustomerOrderService,
    CustomerDestinationService,
    LocationIqProvider,
    CustomerJwtGuard,
  ],
  exports: [
    CustomerService,
    CustomerOrderService,
    CustomerDestinationService,
    LocationIqProvider,
    CustomerJwtGuard,
  ],
})
export class CustomerModule {}
