import { OrderStatus } from '../../order/enums/order-status.enum';
import { PaymentStatus } from '../../order/enums/payment-status.enum';

export class CustomerOrderDto {
  id: string;
  customerName: string;
  pickup: string;
  destination: string;
  pickupLocationDetails?: {
    type: string;
    address: Record<string, unknown>;
    coordinates: { latitude: number; longitude: number };
    formattedAddress: string;
  };
  destinationLocationDetails?: {
    type: string;
    address: Record<string, unknown>;
    coordinates: { latitude: number; longitude: number };
    formattedAddress: string;
  };
  distance?: string;
  earnings: string;
  title?: string;
  category?: string;
  notes?: string;
  price?: number;
  quantity?: number;
  itemSubtotal?: number;
  deliveryFee?: number;
  amount?: number;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  paymentProvider?: string;
  paymentTransactionId?: string;
  checkoutUrl?: string;
  estimatedTime?: string;
  status: OrderStatus;
  createdAt: Date;
  acceptedAt?: Date;
  deliveredAt?: Date;
}
