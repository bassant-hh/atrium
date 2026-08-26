export class NotificationDto {
  id: string;
  orderId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
}

export class CustomerNotificationsResponseDto {
  notifications: NotificationDto[];
  unreadCount: number;
}
