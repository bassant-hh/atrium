import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomerOrderService } from './customer-order.service';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { CustomerOrderDto } from './dto/customer-order-response.dto';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';
import { CustomerJwtPayload } from './interfaces/customer-jwt-payload.interface';

@Controller('customer/orders')
@UseGuards(CustomerJwtGuard)
export class CustomerOrderController {
  constructor(private readonly customerOrderService: CustomerOrderService) {}

  @Post()
  async createOrder(
    @Body() dto: CreateCustomerOrderDto,
    @Req() req: Request & { customer: CustomerJwtPayload },
  ): Promise<CustomerOrderDto> {
    return this.customerOrderService.createOrder(dto, req.customer._id);
  }

  @Get()
  async getMyOrders(
    @Req() req: Request & { customer: CustomerJwtPayload },
  ): Promise<CustomerOrderDto[]> {
    return this.customerOrderService.getCustomerOrders(req.customer._id);
  }

  @Get(':id')
  async getOrderById(
    @Param('id') id: string,
    @Req() req: Request & { customer: CustomerJwtPayload },
  ): Promise<CustomerOrderDto> {
    return this.customerOrderService.getOrderById(id, req.customer._id);
  }

  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Req() req: Request & { customer: CustomerJwtPayload },
  ): Promise<CustomerOrderDto> {
    return this.customerOrderService.cancelOrder(id, req.customer._id);
  }
}
