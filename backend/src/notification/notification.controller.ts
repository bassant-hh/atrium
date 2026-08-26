import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import {
  CustomerNotificationsResponseDto,
  NotificationDto,
} from './dto/customer-notification-response.dto';
import { CustomerJwtGuard } from '../customer/guards/customer-jwt.guard';
import { CustomerJwtPayload } from '../customer/interfaces/customer-jwt-payload.interface';

@Controller('customer/notifications')
@UseGuards(CustomerJwtGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMyNotifications(
    @Req() req: Request & { customer: CustomerJwtPayload },
  ): Promise<CustomerNotificationsResponseDto> {
    return this.notificationService.getCustomerNotifications(req.customer._id);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Req() req: Request & { customer: CustomerJwtPayload },
  ): Promise<NotificationDto> {
    return this.notificationService.markAsRead(id, req.customer._id);
  }
}
