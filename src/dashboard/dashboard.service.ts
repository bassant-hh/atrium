import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../order/order.schema';
import { OrderStatus } from '../order/enums/order-status.enum';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getDashboardStats(riderId: string): Promise<DashboardStatsResponseDto> {
    // High-Performance MongoDB Aggregation Pipeline
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
                    $arrayElemAt: [
                      {
                        $regexFindAll: {
                          input: '$earnings',
                          regex: '[0-9]+',
                        },
                      },
                      0,
                    ],
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

    // TODO Phase 5:
    // Compute rating from customer reviews.
    const rating = 4.9;

    // TODO Phase 5:
    // Compute online hours from rider activity logs.
    const onlineHours = 5.3;

    return {
      earnings,
      completed,
      rating,
      onlineHours,
    };
  }
}
