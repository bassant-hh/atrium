import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
    fullname: string;

    @Prop()
    role: "CLIENT" | "DELIVERY" = 'CLIENT';

    @Prop({ required: false })
    idCard?: string;

    @Prop({ required: false })
    token?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);