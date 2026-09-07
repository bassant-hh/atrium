import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentStatus } from './enums/payment-status.enum';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: false })
  clientId?: string;

  @Prop({ required: false })
  riderId?: string;

  @Prop({ type: [String], default: [] })
  declinedRiderIds?: string[];

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  pickup: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: false, type: Object })
  pickupLocationDetails?: {
    type: string;
    address: Record<string, unknown>;
    coordinates: { latitude: number; longitude: number };
    formattedAddress: string;
  };

  @Prop({ required: false, type: Object })
  destinationLocationDetails?: {
    type: string;
    address: Record<string, unknown>;
    coordinates: { latitude: number; longitude: number };
    formattedAddress: string;
  };

  @Prop({ required: false })
  distance?: string;

  @Prop({ required: true })
  earnings: string;

  @Prop({ required: false })
  title?: string;

  @Prop({ required: false })
  category?: string;

  @Prop({ required: false })
  notes?: string;

  @Prop({ required: false })
  price?: number;

  @Prop({ required: false })
  quantity?: number;

  @Prop({ required: false })
  itemSubtotal?: number;

  @Prop({ required: false, default: 5 })
  deliveryFee?: number;

  @Prop({ required: false })
  amount?: number;

  @Prop({ type: String, default: PaymentMethod.CASH, enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @Prop({ type: String, default: PaymentStatus.PENDING, enum: PaymentStatus })
  paymentStatus?: PaymentStatus;

  @Prop({ required: false })
  paymentProvider?: string;

  @Prop({ required: false })
  paymentTransactionId?: string;

  @Prop({ required: false })
  paymentReference?: string;

  @Prop({ required: false })
  estimatedTime?: string;

  @Prop({ type: String, default: OrderStatus.AVAILABLE, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ required: false })
  acceptedAt?: Date;

  @Prop({ required: false })
  deliveredAt?: Date;

  @Prop({ required: false })
  createdAt?: Date;

  @Prop({ required: false })
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Active Production MongoDB Indexes
OrderSchema.index({ status: 1 });
OrderSchema.index({ riderId: 1 });
OrderSchema.index({ declinedRiderIds: 1 });
OrderSchema.index({ riderId: 1, status: 1 });
OrderSchema.index({ clientId: 1 });
OrderSchema.index({ paymentStatus: 1 });
