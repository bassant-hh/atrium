import { OrderStatus } from '../../order/enums/order-status.enum';

export class CustomerOrderDto {
  id: string;
  customerName: string;
  pickup: string;
  destination: string;
  pickupLocationDetails?: {
    type: string;
    address: Record<string, any>;
    coordinates: { latitude: number; longitude: number };
    formattedAddress: string;
  };
  destinationLocationDetails?: {
    type: string;
    address: Record<string, any>;
    coordinates: { latitude: number; longitude: number };
    formattedAddress: string;
  };
  distance: string;
  earnings: string;
  title?: string;
  category?: string;
  notes?: string;
  amount?: number;
  estimatedTime?: string;
  status: OrderStatus;
  createdAt: Date;
  acceptedAt?: Date;
  deliveredAt?: Date;
}
