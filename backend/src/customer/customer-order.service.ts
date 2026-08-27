import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './customer.schema';
import { Order, OrderDocument } from '../order/order.schema';
import { OrderStatus } from '../order/enums/order-status.enum';
import { PaymentMethod } from '../order/enums/payment-method.enum';
import { PaymentStatus } from '../order/enums/payment-status.enum';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { CustomerOrderDto } from './dto/customer-order-response.dto';
import {
  DEFAULT_CUSTOMER_ORDER_DISTANCE,
  DEFAULT_CUSTOMER_ORDER_ESTIMATED_TIME,
  DEFAULT_CUSTOMER_ORDER_EARNINGS,
  DEFAULT_DELIVERY_FEE,
} from './constants/customer-order.constants';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class CustomerOrderService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly paymentService: PaymentService,
  ) {}

  private mapToDto(order: OrderDocument): CustomerOrderDto {
    const unitPrice = order.price;
    const qty = order.quantity;
    const itemSubtotal =
      order.itemSubtotal ??
      (unitPrice != null && qty != null ? unitPrice * qty : undefined);
    const deliveryFee = order.deliveryFee ?? DEFAULT_DELIVERY_FEE;
    const amount =
      order.amount ??
      (itemSubtotal != null ? itemSubtotal + deliveryFee : undefined);

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
      price: unitPrice,
      quantity: qty,
      itemSubtotal: itemSubtotal,
      deliveryFee: deliveryFee,
      amount: amount,
      paymentMethod: order.paymentMethod || PaymentMethod.CASH,
      paymentStatus: order.paymentStatus || PaymentStatus.PENDING,
      paymentProvider: order.paymentProvider,
      paymentTransactionId: order.paymentTransactionId,
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

    // 1. Sanity Validation for Price and Quantity
    if (dto.price !== undefined) {
      if (
        typeof dto.price !== 'number' ||
        !Number.isFinite(dto.price) ||
        dto.price < 0
      ) {
        throw new BadRequestException(
          'Item price must be a valid non-negative number.',
        );
      }
    }

    if (dto.quantity !== undefined) {
      if (
        typeof dto.quantity !== 'number' ||
        !Number.isFinite(dto.quantity) ||
        dto.quantity <= 0
      ) {
        throw new BadRequestException(
          'Quantity must be a valid positive integer.',
        );
      }
    }

    // 2. Authoritative Server-Side Amount Calculation & Validation
    const unitPrice = dto.price ?? 0;
    const qty = dto.quantity ?? 1;
    const itemSubtotal = unitPrice * qty;
    const deliveryFee = DEFAULT_DELIVERY_FEE;
    const expectedAmount = itemSubtotal + deliveryFee;

    if (dto.amount !== undefined) {
      if (
        typeof dto.amount !== 'number' ||
        !Number.isFinite(dto.amount) ||
        dto.amount < 0
      ) {
        throw new BadRequestException(
          'Order amount must be a valid non-negative number.',
        );
      }
      if (Math.abs(dto.amount - expectedAmount) > 0.01) {
        throw new BadRequestException(
          `Submitted order amount (${dto.amount}) does not match expected calculated total (${expectedAmount}).`,
        );
      }
    }

    const customerName = `${customer.firstName} ${customer.lastName}`.trim();
    const selectedMethod = dto.paymentMethod || PaymentMethod.CASH;

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
      price: unitPrice,
      quantity: qty,
      itemSubtotal: itemSubtotal,
      deliveryFee: deliveryFee,
      amount: expectedAmount,
      paymentMethod: selectedMethod,
      paymentStatus: PaymentStatus.PENDING,
      paymentProvider:
        selectedMethod === PaymentMethod.CASH ? 'CASH' : 'PAYMOB',
      distance: DEFAULT_CUSTOMER_ORDER_DISTANCE,
      estimatedTime: DEFAULT_CUSTOMER_ORDER_ESTIMATED_TIME,
      earnings: DEFAULT_CUSTOMER_ORDER_EARNINGS,
      status: OrderStatus.AVAILABLE,
      declinedRiderIds: [],
    });

    const savedOrder = await createdOrder.save();

    // Broadcast new AVAILABLE order to connected eligible riders via realtime gateway
    this.realtimeGateway.notifyOrderAvailable({
      id: savedOrder._id.toString(),
      customerName: savedOrder.customerName,
      pickup: savedOrder.pickup,
      destination: savedOrder.destination,
      distance: savedOrder.distance,
      earnings: savedOrder.earnings,
    });

    const responseDto = this.mapToDto(savedOrder);

    // If payment method is CARD or WALLET, attempt Paymob session creation
    if (
      selectedMethod === PaymentMethod.CARD ||
      selectedMethod === PaymentMethod.WALLET
    ) {
      try {
        const session = await this.paymentService.createPaymobCheckoutSession(
          savedOrder,
          savedOrder.customerName,
          customer.email,
          customer.phone,
          selectedMethod,
        );
        if (session && session.checkoutUrl) {
          responseDto.checkoutUrl = session.checkoutUrl;
        }
      } catch (paymobError: any) {
        // Payment session warning is non-blocking to allow fallback to order tracking
        responseDto.checkoutUrl = undefined;
      }
    }

    return responseDto;
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

  async cancelOrder(
    orderId: string,
    customerId: string,
  ): Promise<CustomerOrderDto> {
    // 1. Atomic Ownership + Status Guard Update (AVAILABLE -> CANCELLED)
    const updatedOrder = await this.orderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          clientId: customerId,
          status: OrderStatus.AVAILABLE,
        },
        {
          $set: { status: OrderStatus.CANCELLED },
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updatedOrder) {
      const existingOrder = await this.orderModel.findById(orderId).exec();

      if (!existingOrder || existingOrder.clientId !== customerId) {
        throw new NotFoundException(`Order #${orderId} not found.`);
      }

      throw new ConflictException(
        'Cannot cancel order. Order is no longer available or is already in progress.',
      );
    }

    // 2. Broadcast realtime order removal event to connected riders ONLY after DB update succeeds
    this.realtimeGateway.notifyOrderUnavailable(orderId);

    return this.mapToDto(updatedOrder);
  }
}
