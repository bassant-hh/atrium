export class CustomerOrderDto {
  id: string;
  title: string;
  category: string;
  pickup: string;
  destination: string;
  status: string;
  amount: number;
  earnings: string;
  estimatedTime?: string;
  createdAt?: Date;
}

export class CustomerOrderDetailsDto extends CustomerOrderDto {
  notes?: string;
  distance?: string;
  customerName?: string;
}

export class CreateOrderResponseDto {
  success: boolean;
  message: string;
  order: CustomerOrderDetailsDto;
}
