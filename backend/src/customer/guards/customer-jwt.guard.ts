import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { CustomerJwtPayload } from '../interfaces/customer-jwt-payload.interface';

@Injectable()
export class CustomerJwtGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { customer?: CustomerJwtPayload }>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or malformed Authorization header.',
      );
    }

    const token = authHeader.slice(7);
    const secret =
      this.configService.get<string>('JWT_SECRET') ?? 'somesecretkey';

    try {
      const payload = jwt.verify(token, secret) as CustomerJwtPayload;

      if (payload.type !== 'CUSTOMER') {
        throw new UnauthorizedException(
          'Invalid token type for customer access.',
        );
      }

      request.customer = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired customer token.');
    }
  }
}
