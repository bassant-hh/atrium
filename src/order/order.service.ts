import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { OrderStatus } from './enums/order-status.enum';
import { NearbyOrderResponseDto } from './dto/nearby-order-response.dto';
import {
  AcceptOrderResponseDto,
  ActiveDeliveryDto,
} from './dto/accept-order-response.dto';
import { DeclineOrderResponseDto } from './dto/decline-order-response.dto';
import { PickupOrderResponseDto } from './dto/pickup-order-response.dto';
import { DeliverOrderResponseDto } from './dto/deliver-order-response.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { VerificationStatus } from '../rider/enums/verification-status.enum';
import { RiderDutyStatus } from '../rider/enums/rider-duty-status.enum';

type OrderFilterQuery = {
  status?: OrderStatus;
  declinedRiderIds?: { $ne: string };
};

@Injectable()
export class OrderService {
  // ==========================================================================
  // Dependencies
  // ==========================================================================
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // ==========================================================================
  // Private Helpers
  // ==========================================================================
  private mapNearbyOrder(order: {
    _id: { toString(): string } | string;
    customerName: string;
    pickup: string;
    destination: string;
    distance: string;
    earnings: string;
  }): NearbyOrderResponseDto {
    return {
      id: order._id.toString(),
      customerName: order.customerName,
      pickup: order.pickup,
      destination: order.destination,
      distance: order.distance,
      earnings: order.earnings,
    };
  }

  private mapActiveDelivery(order: {
    _id: { toString(): string } | string;
    customerName: string;
    pickup: string;
    destination: string;
    estimatedTime?: string;
    status?: string;
  }): ActiveDeliveryDto {
    return {
      orderId: order._id.toString(),
      customerName: order.customerName,
      pickup: order.pickup,
      dropoff: order.destination,
      estimatedTime: order.estimatedTime ?? '15 mins',
      status: order.status,
    };
  }

  private async validateRider(
    riderId: string,
    requiredDutyStatus?: RiderDutyStatus,
  ): Promise<UserDocument> {
    const rider = await this.userModel.findById(riderId).lean().exec();

    if (!rider) {
      throw new NotFoundException('Rider user not found.');
    }

    if (rider.status !== VerificationStatus.APPROVED) {
      throw new ForbiddenException(
        'Rider verification status is not APPROVED.',
      );
    }

    if (requiredDutyStatus && rider.dutyStatus !== requiredDutyStatus) {
      throw new ForbiddenException(
        `Rider duty status must be ${requiredDutyStatus}.`,
      );
    }

    return rider as UserDocument;
  }

  // ==========================================================================
  // Nearby Orders
  // ==========================================================================
  async getNearbyOrders(riderId?: string): Promise<NearbyOrderResponseDto[]> {
    // TODO Phase 3.4: Filter nearby orders by rider location & distance calculation
    const query: OrderFilterQuery = { status: OrderStatus.AVAILABLE };

    if (riderId) {
      query.declinedRiderIds = { $ne: riderId };
    }

    const orders = await this.orderModel
      .find(query)
      .select({
        customerName: 1,
        pickup: 1,
        destination: 1,
        distance: 1,
        earnings: 1,
      })
      .lean()
      .exec();

    return orders.map((order) => this.mapNearbyOrder(order));
  }

  // ==========================================================================
  // Accept Order
  // ==========================================================================
  async acceptOrder(
    orderId: string,
    riderId: string,
  ): Promise<AcceptOrderResponseDto> {
    // 1. Validate Rider (APPROVED & ONLINE)
    await this.validateRider(riderId, RiderDutyStatus.ONLINE);

    // 2. Inspect order state to distinguish specific exceptions
    const existingOrder = await this.orderModel.findById(orderId).lean().exec();

    if (!existingOrder) {
      throw new NotFoundException('Order not found.');
    }

    if (existingOrder.status !== OrderStatus.AVAILABLE) {
      throw new ConflictException(
        'Order is no longer available or has already been accepted.',
      );
    }

    if (
      existingOrder.declinedRiderIds &&
      existingOrder.declinedRiderIds.includes(riderId)
    ) {
      throw new ConflictException('You have already declined this order.');
    }

    // 3. Atomic Order Acceptance Update
    const updatedOrder = await this.orderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          status: OrderStatus.AVAILABLE,
          declinedRiderIds: { $ne: riderId },
        },
        {
          $set: {
            status: OrderStatus.ACCEPTED,
            riderId: riderId,
            acceptedAt: new Date(),
          },
        },
        { new: true, lean: true },
      )
      .exec();

    if (!updatedOrder) {
      throw new ConflictException(
        'Order is no longer available or has been modified by another rider.',
      );
    }

    // 4. Fully Atomic Rider Duty Status Transition (ONLINE -> DELIVERING)
    const updatedRider = await this.userModel
      .findOneAndUpdate(
        { _id: riderId, dutyStatus: RiderDutyStatus.ONLINE },
        { $set: { dutyStatus: RiderDutyStatus.DELIVERING } },
        { new: true, lean: true },
      )
      .exec();

    if (!updatedRider) {
      throw new ConflictException('Rider is no longer ONLINE.');
    }

    return {
      success: true,
      message: 'Order accepted successfully.',
      activeDelivery: this.mapActiveDelivery(updatedOrder),
    };
  }

  // ==========================================================================
  // Decline Order
  // ==========================================================================
  async declineOrder(
    orderId: string,
    riderId: string,
  ): Promise<DeclineOrderResponseDto> {
    const result = await this.orderModel
      .updateOne(
        { _id: orderId, status: OrderStatus.AVAILABLE },
        { $addToSet: { declinedRiderIds: riderId } },
      )
      .exec();

    if (result.matchedCount === 0) {
      const existingOrder = await this.orderModel
        .findById(orderId)
        .lean()
        .exec();

      if (!existingOrder) {
        throw new NotFoundException('Order not found.');
      }

      throw new ConflictException(
        'Cannot decline order. Order is no longer available.',
      );
    }

    return {
      success: true,
      message: 'Order declined successfully.',
    };
  }

  // ==========================================================================
  // Pickup Order (Phase 3.4 Part 1)
  // ==========================================================================
  async pickupOrder(
    orderId: string,
    riderId: string,
  ): Promise<PickupOrderResponseDto> {
    // 1. Validate Rider (APPROVED & DELIVERING)
    await this.validateRider(riderId, RiderDutyStatus.DELIVERING);

    // 2. Validate Order existence and ownership
    const order = await this.orderModel.findById(orderId).lean().exec();

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.riderId !== riderId) {
      throw new ForbiddenException('You are not assigned to this order.');
    }

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new ConflictException(
        'Order must be in ACCEPTED status to be picked up.',
      );
    }

    // 3. Atomic Order Status Update (ACCEPTED -> PICKED_UP)
    const updatedOrder = await this.orderModel
      .findOneAndUpdate(
        { _id: orderId, riderId: riderId, status: OrderStatus.ACCEPTED },
        { $set: { status: OrderStatus.PICKED_UP } },
        { new: true, lean: true },
      )
      .exec();

    if (!updatedOrder) {
      throw new ConflictException(
        'Unable to pickup order. Order status may have changed.',
      );
    }

    return {
      success: true,
      message: 'Order picked up successfully.',
      activeDelivery: this.mapActiveDelivery(updatedOrder),
    };
  }

  // ==========================================================================
  // Deliver Order (Phase 3.4 Part 2 - Atomic Transaction)
  // ==========================================================================
  async deliverOrder(
    orderId: string,
    riderId: string,
  ): Promise<DeliverOrderResponseDto> {
    // 1. Validate Rider (APPROVED & DELIVERING)
    await this.validateRider(riderId, RiderDutyStatus.DELIVERING);

    // 2. Validate Order existence and ownership
    const order = await this.orderModel.findById(orderId).lean().exec();

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.riderId !== riderId) {
      throw new ForbiddenException('You are not assigned to this order.');
    }

    if (order.status !== OrderStatus.PICKED_UP) {
      throw new ConflictException(
        'Order must be in PICKED_UP status to be delivered.',
      );
    }

    // 3. Atomic MongoDB Session Transaction for 100% Data Consistency
    const session = await this.orderModel.db.startSession();
    try {
      session.startTransaction();

      const updatedOrder = await this.orderModel
        .findOneAndUpdate(
          { _id: orderId, riderId: riderId, status: OrderStatus.PICKED_UP },
          { $set: { status: OrderStatus.DELIVERED, deliveredAt: new Date() } },
          { new: true, lean: true, session },
        )
        .exec();

      if (!updatedOrder) {
        throw new ConflictException(
          'Unable to deliver order. Order status may have changed.',
        );
      }

      const updatedRider = await this.userModel
        .findOneAndUpdate(
          { _id: riderId, dutyStatus: RiderDutyStatus.DELIVERING },
          { $set: { dutyStatus: RiderDutyStatus.ONLINE } },
          { new: true, lean: true, session },
        )
        .exec();

      if (!updatedRider) {
        throw new ConflictException('Rider is no longer in DELIVERING status.');
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return {
      success: true,
      message: 'Order delivered successfully.',
    };
  }

  // ==========================================================================
  // Active Order Endpoint (Phase 4 Part 2)
  // ==========================================================================
  async getActiveOrder(riderId: string): Promise<ActiveDeliveryDto | null> {
    const activeOrder = await this.orderModel
      .findOne({
        riderId: riderId,
        status: { $in: [OrderStatus.ACCEPTED, OrderStatus.PICKED_UP] },
      })
      .select({
        customerName: 1,
        pickup: 1,
        destination: 1,
        estimatedTime: 1,
        status: 1,
      })
      .lean()
      .exec();

    if (!activeOrder) {
      return null;
    }

    return this.mapActiveDelivery(activeOrder);
  }
}
