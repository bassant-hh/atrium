import { ActiveDeliveryDto } from './accept-order-response.dto';

export class PickupOrderResponseDto {
  success: boolean;
  message: string;
  activeDelivery: ActiveDeliveryDto & { status?: string };
}
