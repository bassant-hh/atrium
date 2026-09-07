import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { VerificationStatus } from '../rider/enums/verification-status.enum';
import { RiderDutyStatus } from '../rider/enums/rider-duty-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  university: string;

  @Prop()
  role: 'ADMIN' | 'CLIENT' | 'DELIVERY' = 'CLIENT';

  @Prop({ required: true })
  idFront: string;

  @Prop({ required: true })
  idBack: string;

  @Prop({ type: String, default: 'PENDING' })
  status: VerificationStatus;

  @Prop({ type: String, default: 'OFFLINE' })
  dutyStatus: RiderDutyStatus;

  @Prop({ required: false })
  token?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
