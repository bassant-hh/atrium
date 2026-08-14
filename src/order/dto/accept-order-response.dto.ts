export class ActiveDeliveryDto {
  orderId: string;
  customerName: string;
  pickup: string;
  dropoff: string;
  estimatedTime: string;
  status?: string;
  pickupCoordinates?: { latitude: number; longitude: number };
  destinationCoordinates?: { latitude: number; longitude: number };
}

export class AcceptOrderResponseDto {
  success: boolean;
  message: string;
  activeDelivery: ActiveDeliveryDto;
}
