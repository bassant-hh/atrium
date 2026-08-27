export interface ActiveDelivery {
  orderId: string;
  customerName: string;
  pickup: string;
  dropoff: string;
  estimatedTime: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  amount?: number;
  pickupCoordinates?: { latitude: number; longitude: number };
  destinationCoordinates?: { latitude: number; longitude: number };
}

export interface NearbyOrder {
  id: string;
  customerName: string;
  pickup: string;
  destination: string;
  distance: string;
  earnings: string;
  paymentMethod?: string;
  paymentStatus?: string;
  amount?: number;
}

export interface AcceptOrderResponse {
  success: boolean;
  message: string;
  activeDelivery: ActiveDelivery;
}

export interface DeclineOrderResponse {
  success: boolean;
  message: string;
}

export interface PickupOrderResponse {
  success: boolean;
  message: string;
  activeDelivery: ActiveDelivery;
}

export interface DeliverOrderResponse {
  success: boolean;
  message: string;
}
