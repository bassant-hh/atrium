import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderStatus } from './enums/order-status.enum';

export type OrderDocument = HydratedDocument<Order>;

// ============================================================================
// Recommended Production Indexes for Database Scalability:
// OrderSchema.index({ status: 1 });
// OrderSchema.index({ riderId: 1 });
// OrderSchema.index({ declinedRiderIds: 1 });
// OrderSchema.index({ riderId: 1, status: 1 });
// ============================================================================

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

  @Prop({ required: true })
  distance: string;

  @Prop({ required: true })
  earnings: string;

  @Prop({ required: false, default: '15 mins' })
  estimatedTime?: string;

  @Prop({ type: String, default: OrderStatus.AVAILABLE, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ required: false })
  acceptedAt?: Date;

  @Prop({ required: false })
  deliveredAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
