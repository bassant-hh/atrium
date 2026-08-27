import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { NotificationType } from './enums/notification-type.enum';
import {
  CustomerNotificationsResponseDto,
  NotificationDto,
} from './dto/customer-notification-response.dto';

export interface CreateNotificationParams {
  customerId: string;
  orderId: string;
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(
    params: CreateNotificationParams,
  ): Promise<NotificationDocument | null> {
    try {
      if (!params.customerId || !params.orderId) {
        this.logger.warn(
          'Cannot create notification: customerId or orderId is missing.',
        );
        return null;
      }

      const created = await this.notificationModel.create({
        customerId: params.customerId,
        orderId: params.orderId,
        type: params.type,
        title: params.title,
        message: params.message,
        isRead: false,
      });

      this.logger.log(
        `Notification created [${params.type}] for customer ${params.customerId} (order #${params.orderId})`,
      );
      return created;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create notification for customer ${params.customerId}: ${msg}`,
      );
      return null;
    }
  }

  async getCustomerNotifications(
    customerId: string,
  ): Promise<CustomerNotificationsResponseDto> {
    const docs = await this.notificationModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .exec();

    const unreadCount = await this.notificationModel.countDocuments({
      customerId,
      isRead: false,
    });

    const notifications: NotificationDto[] = docs.map((doc) => ({
      id: doc._id.toString(),
      orderId: doc.orderId,
      type: doc.type,
      title: doc.title,
      message: doc.message,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
    }));

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(
    notificationId: string,
    customerId: string,
  ): Promise<NotificationDto> {
    const updated = await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, customerId },
        { $set: { isRead: true } },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Notification not found or access denied.');
    }

    return {
      id: updated._id.toString(),
      orderId: updated.orderId,
      type: updated.type,
      title: updated.title,
      message: updated.message,
      isRead: updated.isRead,
      createdAt: updated.createdAt,
    };
  }

  async clearAll(customerId: string): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel
      .deleteMany({ customerId })
      .exec();

    return {
      deletedCount: result.deletedCount || 0,
    };
  }
}
