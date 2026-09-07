import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../order/order.schema';
import { OrderStatus } from '../order/enums/order-status.enum';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';

import {
  DutySession,
  DutySessionDocument,
} from '../rider/schemas/duty-session.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(DutySession.name)
    private readonly dutySessionModel: Model<DutySessionDocument>,
  ) {}

  async getDashboardStats(riderId: string): Promise<DashboardStatsResponseDto> {
    // High-Performance MongoDB Aggregation Pipeline for Orders & Earnings
    const [result] = await this.orderModel.aggregate<{
      completed: number;
      totalEarnings: number;
    }>([
      {
        $match: {
          riderId: riderId,
          status: OrderStatus.DELIVERED,
        },
      },
      {
        $group: {
          _id: null,
          completed: { $sum: 1 },
          totalEarnings: {
            $sum: {
              $toInt: {
                $ifNull: [
                  {
                    $let: {
                      vars: {
                        matchObj: {
                          $regexFind: {
                            input: '$earnings',
                            regex: '[0-9]+',
                          },
                        },
                      },
                      in: '$$matchObj.match',
                    },
                  },
                  '0',
                ],
              },
            },
          },
        },
      },
    ]);

    const completed = result?.completed ?? 0;
    const earnings = result?.totalEarnings ?? 0;

    // 1. Reconcile stale sessions (>5 mins without heartbeat while open)
    const STALE_THRESHOLD_MS = 5 * 60 * 1000;
    const now = new Date();
    const nowTime = now.getTime();

    const openSession = await this.dutySessionModel
      .findOne({
        riderId,
        endedAt: { $exists: false },
      })
      .exec();

    if (openSession) {
      const lastSeen = openSession.lastHeartbeatAt
        ? new Date(openSession.lastHeartbeatAt).getTime()
        : new Date(openSession.startedAt).getTime();

      if (nowTime - lastSeen > STALE_THRESHOLD_MS) {
        openSession.endedAt = new Date(lastSeen);
        await openSession.save();
      }
    }

    // 2. Authoritative calculation of TODAY'S online hours (Africa/Cairo calendar day overlap)
    const cairoDateStr = now.toLocaleDateString('en-US', {
      timeZone: 'Africa/Cairo',
    });
    const cairoDate = new Date(cairoDateStr);
    const startOfDay = new Date(
      cairoDate.getFullYear(),
      cairoDate.getMonth(),
      cairoDate.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      cairoDate.getFullYear(),
      cairoDate.getMonth(),
      cairoDate.getDate(),
      23,
      59,
      59,
      999,
    );

    const startOfDayTime = startOfDay.getTime();
    const endOfDayTime = endOfDay.getTime();

    const sessions = await this.dutySessionModel
      .find({
        riderId,
        startedAt: { $lte: endOfDay },
      })
      .exec();

    let todayTotalSeconds = 0;

    for (const session of sessions) {
      const sStart = new Date(session.startedAt).getTime();
      const sEnd = session.endedAt
        ? new Date(session.endedAt).getTime()
        : nowTime;

      const overlapStart = Math.max(sStart, startOfDayTime);
      const overlapEnd = Math.min(sEnd, nowTime, endOfDayTime);

      if (overlapEnd > overlapStart) {
        todayTotalSeconds += (overlapEnd - overlapStart) / 1000;
      }
    }

    const onlineHours = Number((todayTotalSeconds / 3600).toFixed(2));

    return {
      earnings,
      completed,
      onlineHours,
    };
  }
}
