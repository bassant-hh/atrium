export class ActiveDeliveryDto {
  orderId: string;
  customerName: string;
  pickup: string;
  dropoff: string;
  estimatedTime: string;
  status?: string;
}

export class AcceptOrderResponseDto {
  success: boolean;
  message: string;
  activeDelivery: ActiveDeliveryDto;
}
