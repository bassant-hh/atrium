export interface ActiveDelivery {
  orderId: string;
  customerName: string;
  pickup: string;
  dropoff: string;
  estimatedTime: string;
  status?: string;
}

export interface NearbyOrder {
  id: string;
  customerName: string;
  pickup: string;
  destination: string;
  distance: string;
  earnings: string;
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
