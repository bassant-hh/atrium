import {
  Controller,
  Get,
  Param,
  Patch,
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

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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
