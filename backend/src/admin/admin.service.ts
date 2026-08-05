import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

const RIDER_PROJECTION = '-password -token -__v';

@Injectable()
export class AdminService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getPendingRiders(): Promise<User[]> {
    return this.userModel
      .find({ role: 'DELIVERY', status: 'PENDING' })
      .select(RIDER_PROJECTION)
      .exec();
  }

  async getAllRiders(): Promise<User[]> {
    return this.userModel
      .find({ role: 'DELIVERY' })
      .select(RIDER_PROJECTION)
      .exec();
  }

  async approveRider(id: string): Promise<User> {
    const rider = await this.userModel
      .findByIdAndUpdate(id, { status: 'APPROVED' }, { new: true })
      .select(RIDER_PROJECTION)
      .exec();

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    return rider;
  }

  async rejectRider(id: string): Promise<User> {
    const rider = await this.userModel
      .findByIdAndUpdate(id, { status: 'REJECTED' }, { new: true })
      .select(RIDER_PROJECTION)
      .exec();

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    return rider;
  }
}
