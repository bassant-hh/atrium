import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';

import { Order, OrderDocument } from '../order/order.schema';
import { OrderStatus } from '../order/enums/order-status.enum';

interface AuthenticatedSocketData {
  userId: string;
  role: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: 'realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  handleConnection(client: Socket) {
    try {
      const rawToken =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization ||
        client.handshake.query?.token;

      if (!rawToken || typeof rawToken !== 'string') {
        client.emit('order:tracking:error', {
          message: 'Authentication token missing.',
        });
        client.disconnect(true);
        return;
      }

      const token = rawToken.startsWith('Bearer ')
        ? rawToken.slice(7)
        : rawToken;
      const secret =
        this.configService.get<string>('JWT_SECRET') ?? 'somesecretkey';

      const payload = jwt.verify(token, secret) as any;

      const userId = payload._id || payload.customerId || payload.sub;
      const role = payload.type || payload.role || 'GUEST';

      if (!userId) {
        client.emit('order:tracking:error', {
          message: 'Invalid token payload identity.',
        });
        client.disconnect(true);
        return;
      }

      client.data.user = {
        userId: String(userId),
        role: String(role).toUpperCase(),
      } as AuthenticatedSocketData;
    } catch {
      client.emit('order:tracking:error', {
        message: 'Invalid or expired authentication token.',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Socket disconnected cleanly
  }

  @SubscribeMessage('order:tracking:join')
  async handleJoinOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderId: string },
  ) {
    const user: AuthenticatedSocketData = client.data.user;
    if (!user || !payload?.orderId) {
      client.emit('order:tracking:error', {
        message: 'Invalid room join payload.',
      });
      return;
    }

    const { orderId } = payload;
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      client.emit('order:tracking:error', { message: 'Order not found.' });
      return;
    }

    const isTrackable =
      order.status === OrderStatus.ACCEPTED ||
      order.status === OrderStatus.PICKED_UP;

    if (!isTrackable) {
      client.emit('order:tracking:error', {
        message: 'Order status is not active for live tracking.',
      });
      return;
    }

    // Customer authorization check
    if (user.role === 'CUSTOMER' || user.role === 'CLIENT') {
      if (String(order.clientId) !== String(user.userId)) {
        client.emit('order:tracking:error', {
          message: 'Unauthorized access to order tracking.',
        });
        return;
      }
    }

    // Rider authorization check
    if (user.role === 'DELIVERY' || user.role === 'RIDER') {
      if (String(order.riderId) !== String(user.userId)) {
        client.emit('order:tracking:error', {
          message: 'Unauthorized rider access to order tracking.',
        });
        return;
      }
    }

    const roomName = `order:${orderId}`;
    client.join(roomName);
    client.emit('order:tracking:joined', {
      orderId,
      status: order.status,
      room: roomName,
    });
  }

  @SubscribeMessage('order:tracking:leave')
  handleLeaveOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderId: string },
  ) {
    if (payload?.orderId) {
      client.leave(`order:${payload.orderId}`);
    }
  }

  @SubscribeMessage('rider:location:update')
  async handleRiderLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      orderId: string;
      coordinates: { latitude: number; longitude: number };
      timestamp?: number;
    },
  ) {
    const user: AuthenticatedSocketData = client.data.user;

    if (
      !user ||
      (user.role !== 'DELIVERY' && user.role !== 'RIDER') ||
      !payload?.orderId ||
      !payload?.coordinates
    ) {
      return;
    }

    const { latitude, longitude } = payload.coordinates;

    // Coordinate range validation
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return;
    }

    const order = await this.orderModel.findById(payload.orderId).exec();
    if (
      !order ||
      String(order.riderId) !== String(user.userId) ||
      (order.status !== OrderStatus.ACCEPTED &&
        order.status !== OrderStatus.PICKED_UP)
    ) {
      return;
    }

    const roomName = `order:${payload.orderId}`;
    const broadcastPayload = {
      orderId: payload.orderId,
      coordinates: {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
      },
      timestamp: payload.timestamp || Date.now(),
    };

    // Broadcast live coordinates to order room
    this.server.to(roomName).emit('rider:location:updated', broadcastPayload);
  }
}
