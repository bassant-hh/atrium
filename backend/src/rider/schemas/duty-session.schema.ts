import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type DutySessionDocument = HydratedDocument<DutySession>;

@Schema({ timestamps: true })
export class DutySession {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  riderId: string;

  @Prop({ required: true, type: Date })
  startedAt: Date;

  @Prop({ type: Date, required: false })
  endedAt?: Date;

  @Prop({ type: Date, required: false })
  lastHeartbeatAt?: Date;
}

export const DutySessionSchema = SchemaFactory.createForClass(DutySession);

DutySessionSchema.index({ riderId: 1 });
DutySessionSchema.index({ riderId: 1, endedAt: 1 });
DutySessionSchema.index({ riderId: 1, endedAt: 1, lastHeartbeatAt: 1 });
