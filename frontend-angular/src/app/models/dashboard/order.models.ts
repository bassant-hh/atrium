export interface ActiveDelivery {
  orderId: string;
  customerName: string;
  pickup: string;
  dropoff: string;
  estimatedTime: string;
}

export interface NearbyOrder {
  id: string;
  customerName: string;
  pickup: string;
  destination: string;
  distance: string;
  earnings: string;
}
