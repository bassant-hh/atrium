import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './customer.schema';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerJwtGuard],
  exports: [CustomerService, CustomerJwtGuard],
})
export class CustomerModule {}
