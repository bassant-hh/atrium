import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrderService } from './order.service';
import { NearbyOrderResponseDto } from './dto/nearby-order-response.dto';
import {
  AcceptOrderResponseDto,
  ActiveDeliveryDto,
} from './dto/accept-order-response.dto';
import { DeclineOrderResponseDto } from './dto/decline-order-response.dto';
import { PickupOrderResponseDto } from './dto/pickup-order-response.dto';
import { DeliverOrderResponseDto } from './dto/deliver-order-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  CreateOrderResponseDto,
  CustomerOrderDetailsDto,
  CustomerOrderDto,
} from './dto/customer-order-response.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() dto: CreateOrderDto,
    @Request() req: { user: JwtUserPayload },
  ): Promise<CreateOrderResponseDto> {
    return this.orderService.createOrder(dto, req.user._id);
  }

  @Get('nearby')
  async getNearbyOrders(
    @Request() req: { user: JwtUserPayload },
  ): Promise<NearbyOrderResponseDto[]> {
    return this.orderService.getNearbyOrders(req.user._id);
  }

  @Get('active')
  async getActiveOrder(
    @Request() req: { user: JwtUserPayload },
  ): Promise<ActiveDeliveryDto | null> {
    return this.orderService.getActiveOrder(req.user._id);
  }

  @Get('my')
  async getMyOrders(
    @Request() req: { user: JwtUserPayload },
  ): Promise<CustomerOrderDto[]> {
    return this.orderService.getCustomerOrders(req.user._id);
  }

  @Get(':id')
  async getOrderById(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<CustomerOrderDetailsDto> {
    return this.orderService.getOrderById(id, req.user._id);
  }

  @Patch(':id/accept')
  async acceptOrder(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<AcceptOrderResponseDto> {
    return this.orderService.acceptOrder(id, req.user._id);
  }

  @Patch(':id/decline')
  async declineOrder(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<DeclineOrderResponseDto> {
    return this.orderService.declineOrder(id, req.user._id);
  }

  @Patch(':id/pickup')
  async pickupOrder(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<PickupOrderResponseDto> {
    return this.orderService.pickupOrder(id, req.user._id);
  }

  @Patch(':id/deliver')
  async deliverOrder(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<DeliverOrderResponseDto> {
    return this.orderService.deliverOrder(id, req.user._id);
  }
}
