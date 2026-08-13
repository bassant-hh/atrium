import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './customer.schema';
import { Order, OrderDocument } from '../order/order.schema';
import { OrderStatus } from '../order/enums/order-status.enum';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { CustomerOrderDto } from './dto/customer-order-response.dto';
import {
  DEFAULT_CUSTOMER_ORDER_DISTANCE,
  DEFAULT_CUSTOMER_ORDER_ESTIMATED_TIME,
  DEFAULT_CUSTOMER_ORDER_EARNINGS,
} from './constants/customer-order.constants';

@Injectable()
export class CustomerOrderService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  private mapToDto(order: OrderDocument): CustomerOrderDto {
    return {
      id: order._id.toString(),
      customerName: order.customerName,
      pickup: order.pickup,
      destination: order.destination,
      pickupLocationDetails: order.pickupLocationDetails,
      destinationLocationDetails: order.destinationLocationDetails,
      distance: order.distance,
      earnings: order.earnings,
      title: order.title,
      category: order.category,
      notes: order.notes,
      amount: order.amount,
      estimatedTime: order.estimatedTime,
      status: order.status,
      createdAt: order.createdAt || new Date(),
      acceptedAt: order.acceptedAt,
      deliveredAt: order.deliveredAt,
    };
  }

  async createOrder(
    dto: CreateCustomerOrderDto,
    customerId: string,
  ): Promise<CustomerOrderDto> {
    const customer = await this.customerModel.findById(customerId).exec();
    if (!customer) {
      throw new NotFoundException('Customer profile not found.');
    }

    const customerName = `${customer.firstName} ${customer.lastName}`.trim();

    const createdOrder = new this.orderModel({
      clientId: customerId,
      customerName: customerName || 'Campus Customer',
      pickup: dto.pickup,
      destination: dto.destination,
      pickupLocationDetails: dto.pickupLocationDetails,
      destinationLocationDetails: dto.destinationLocationDetails,
      title: dto.title || 'Campus Order',
      category: dto.category || 'general',
      notes: dto.notes,
      amount: dto.amount,
      distance: DEFAULT_CUSTOMER_ORDER_DISTANCE,
      estimatedTime: DEFAULT_CUSTOMER_ORDER_ESTIMATED_TIME,
      earnings: DEFAULT_CUSTOMER_ORDER_EARNINGS,
      status: OrderStatus.AVAILABLE,
      declinedRiderIds: [],
    });

    const savedOrder = await createdOrder.save();
    return this.mapToDto(savedOrder);
  }

  async getCustomerOrders(customerId: string): Promise<CustomerOrderDto[]> {
    const orders = await this.orderModel
      .find({ clientId: customerId })
      .sort({ createdAt: -1 })
      .exec();

    return orders.map((o) => this.mapToDto(o));
  }

  async getOrderById(
    orderId: string,
    customerId: string,
  ): Promise<CustomerOrderDto> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found.`);
    }

    if (order.clientId !== customerId) {
      throw new ForbiddenException(
        'You do not have permission to view this order.',
      );
    }

    return this.mapToDto(order);
  }
}
