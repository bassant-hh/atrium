export interface Deliveries {
  id: string;
  customerName: string;
  item: string;
  price: number;
  status: 'In Transit' | 'Heading to Pickup';
  pickupLoc: string;
  pickupTime?: string;
  deliveryLoc: string;
  distance: string;
  eta: string;
}


export interface CompletedOrder {
  id: string;
  customerName: string;
  items: string;
  earnings: number;
  rating: number;
}