import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './customer.schema';
import { Order, OrderSchema } from '../order/order.schema';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerOrderController } from './customer-order.controller';
import { CustomerOrderService } from './customer-order.service';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [CustomerController, CustomerOrderController],
  providers: [CustomerService, CustomerOrderService, CustomerJwtGuard],
  exports: [CustomerService, CustomerOrderService, CustomerJwtGuard],
})
export class CustomerModule {}
