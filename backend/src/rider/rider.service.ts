import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { VerificationStatus } from './enums/verification-status.enum';
import { RiderDutyStatus } from './enums/rider-duty-status.enum';
import { RiderStatusResponseDto } from './dto/rider-status-response.dto';
import { UpdateDutyStatusDto } from './dto/update-duty-status.dto';

@Injectable()
export class RiderService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getRiderStatus(userId: string): Promise<RiderStatusResponseDto> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('Rider user not found.');
    }

    return {
      verificationStatus: user.status as VerificationStatus,
      riderStatus: (user.dutyStatus ??
        RiderDutyStatus.OFFLINE) as RiderDutyStatus,
    };
  }

  async updateDutyStatus(
    userId: string,
    dto: UpdateDutyStatusDto,
  ): Promise<RiderStatusResponseDto> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('Rider user not found.');
    }

    // Business Rule: Cannot manually change duty status while currently DELIVERING an order
    if (user.dutyStatus === RiderDutyStatus.DELIVERING) {
      throw new ForbiddenException(
        'Cannot manually change duty status while currently DELIVERING an order.',
      );
    }

    // Business Rule: Cannot switch to ONLINE or active duty if verification status is not APPROVED
    if (
      dto.status === RiderDutyStatus.ONLINE &&
      user.status !== VerificationStatus.APPROVED
    ) {
      throw new ForbiddenException(
        'Cannot switch to ONLINE duty status when verification status is not APPROVED.',
      );
    }

    user.dutyStatus = dto.status;
    await user.save();

    return {
      verificationStatus: user.status as VerificationStatus,
      riderStatus: user.dutyStatus as RiderDutyStatus,
    };
  }
}
