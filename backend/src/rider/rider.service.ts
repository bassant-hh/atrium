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

import {
  DutySession,
  DutySessionDocument,
} from './schemas/duty-session.schema';

@Injectable()
export class RiderService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DutySession.name)
    private dutySessionModel: Model<DutySessionDocument>,
  ) {}

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

    const previousDutyStatus = user.dutyStatus;
    user.dutyStatus = dto.status;
    await user.save();

    // DutySession tracking logic:
    if (
      dto.status === RiderDutyStatus.ONLINE &&
      previousDutyStatus === RiderDutyStatus.OFFLINE
    ) {
      const openSession = await this.dutySessionModel
        .findOne({
          riderId: userId,
          endedAt: { $exists: false },
        })
        .exec();

      if (!openSession) {
        await this.dutySessionModel.create({
          riderId: userId,
          startedAt: new Date(),
          lastHeartbeatAt: new Date(),
        });
      }
    } else if (dto.status === RiderDutyStatus.OFFLINE) {
      const openSession = await this.dutySessionModel
        .findOne({
          riderId: userId,
          endedAt: { $exists: false },
        })
        .exec();

      if (openSession) {
        openSession.endedAt = new Date();
        await openSession.save();
      }
    }

    return {
      verificationStatus: user.status as VerificationStatus,
      riderStatus: user.dutyStatus as RiderDutyStatus,
    };
  }

  async recordHeartbeat(
    userId: string,
  ): Promise<{ success: boolean; riderStatus: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Rider user not found.');
    }

    // Only update heartbeat if rider is actively on duty (ONLINE or DELIVERING)
    if (
      user.dutyStatus === RiderDutyStatus.ONLINE ||
      user.dutyStatus === RiderDutyStatus.DELIVERING
    ) {
      const openSession = await this.dutySessionModel
        .findOne({
          riderId: userId,
          endedAt: { $exists: false },
        })
        .exec();

      if (openSession) {
        openSession.lastHeartbeatAt = new Date();
        await openSession.save();
      } else if (user.dutyStatus === RiderDutyStatus.ONLINE) {
        // If state is ONLINE but no session exists, create one safely
        await this.dutySessionModel.create({
          riderId: userId,
          startedAt: new Date(),
          lastHeartbeatAt: new Date(),
        });
      }
    }

    return {
      success: true,
      riderStatus: user.dutyStatus as string,
    };
  }

  async reconcileStaleSessions(userId: string): Promise<void> {
    const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    const now = new Date().getTime();

    const openSession = await this.dutySessionModel
      .findOne({
        riderId: userId,
        endedAt: { $exists: false },
      })
      .exec();

    if (!openSession) {
      return;
    }

    const lastSeen = openSession.lastHeartbeatAt
      ? new Date(openSession.lastHeartbeatAt).getTime()
      : new Date(openSession.startedAt).getTime();

    if (now - lastSeen > STALE_THRESHOLD_MS) {
      // Reconcile stale session
      openSession.endedAt = new Date(lastSeen);
      await openSession.save();

      const user = await this.userModel.findById(userId).exec();
      if (user && user.dutyStatus === RiderDutyStatus.ONLINE) {
        user.dutyStatus = RiderDutyStatus.OFFLINE;
        await user.save();
      }
    }
  }
}
