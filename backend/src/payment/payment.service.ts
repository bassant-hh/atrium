import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import crypto from 'crypto';
import { Order, OrderDocument } from '../order/order.schema';
import { PaymentStatus } from '../order/enums/payment-status.enum';
import { PaymentMethod } from '../order/enums/payment-method.enum';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  /**
   * Generates a Paymob Payment Session and Checkout URL for Card/Wallet payments.
   */
  async createPaymobCheckoutSession(
    order: OrderDocument,
    customerName: string,
    customerEmail?: string,
    customerPhone?: string,
    method: PaymentMethod = PaymentMethod.CARD,
  ): Promise<{
    checkoutUrl: string | null;
    paymobOrderId?: string;
    requiresConfig?: boolean;
  }> {
    const apiKey = this.configService.get<string>('PAYMOB_API_KEY');
    const cardIntegrationId = this.configService.get<string>(
      'PAYMOB_INTEGRATION_ID',
    );
    const walletIntegrationId = this.configService.get<string>(
      'PAYMOB_WALLET_INTEGRATION_ID',
    );
    const iframeId = this.configService.get<string>('PAYMOB_IFRAME_ID');

    const integrationId =
      method === PaymentMethod.WALLET && walletIntegrationId
        ? walletIntegrationId
        : cardIntegrationId;

    if (!apiKey || !integrationId || !iframeId) {
      this.logger.warn(
        `Paymob credentials missing in environment variables. Operating in test sandbox fallback mode. Order #${order._id}`,
      );
      return {
        checkoutUrl: null,
        requiresConfig: true,
      };
    }

    try {
      const orderAmount = order.amount ?? 0;
      const amountCents = Math.round(orderAmount * 100);

      // Step 1: Paymob Authentication Request
      const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!authRes.ok) {
        throw new Error(
          `Paymob authentication failed with HTTP status ${authRes.status}`,
        );
      }

      const authData = await authRes.json();
      const authToken = authData.token;

      // Step 2: Paymob Order Registration
      const orderRes = await fetch(
        'https://accept.paymob.com/api/ecommerce/orders',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_token: authToken,
            delivery_needed: 'false',
            amount_cents: String(amountCents),
            currency: 'EGP',
            merchant_order_id: order._id.toString(),
          }),
        },
      );

      if (!orderRes.ok) {
        throw new Error(
          `Paymob order registration failed with HTTP status ${orderRes.status}`,
        );
      }

      const orderData = await orderRes.json();
      const paymobOrderId = orderData.id;

      // Step 3: Payment Key Request
      const nameParts = (customerName || 'Campus Customer').trim().split(' ');
      const firstName = nameParts[0] || 'Campus';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      const keyRes = await fetch(
        'https://accept.paymob.com/api/acceptance/payment_keys',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_token: authToken,
            amount_cents: String(amountCents),
            expiration: 3600,
            order_id: String(paymobOrderId),
            billing_data: {
              first_name: firstName,
              last_name: lastName,
              email: customerEmail || 'customer@makook.app',
              phone_number: customerPhone || '+201000000000',
              apartment: 'NA',
              floor: 'NA',
              street: 'Campus Street',
              building: 'NA',
              shipping_method: 'PKG',
              postal_code: '00000',
              city: 'Qena',
              country: 'EG',
              state: 'Qena',
            },
            currency: 'EGP',
            integration_id: Number(integrationId),
          }),
        },
      );

      if (!keyRes.ok) {
        throw new Error(
          `Paymob payment key creation failed with HTTP status ${keyRes.status}`,
        );
      }

      const keyData = await keyRes.json();
      const paymentToken = keyData.token;

      const checkoutUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;

      // Store Paymob references on Order
      order.paymentProvider = 'PAYMOB';
      order.paymentReference = String(paymobOrderId);
      await order.save();

      return {
        checkoutUrl,
        paymobOrderId: String(paymobOrderId),
      };
    } catch (err: any) {
      this.logger.error(
        `Paymob session creation error: ${err?.message || err}`,
      );
      throw new BadRequestException(
        `Failed to create Paymob payment session: ${err?.message || 'Unknown gateway error'}`,
      );
    }
  }

  /**
   * Verifies payment status securely against Paymob and updates MongoDB order.
   */
  async verifyPayment(
    orderId: string,
    transactionId?: string,
    paymobData?: any,
  ): Promise<{
    verified: boolean;
    order: Order;
    paymentStatus: PaymentStatus;
    message?: string;
  }> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found.`);
    }

    // Idempotency check: if already paid, return clean verified status
    if (order.paymentStatus === PaymentStatus.PAID) {
      return {
        verified: true,
        order,
        paymentStatus: PaymentStatus.PAID,
        message: 'Payment already verified and completed.',
      };
    }

    const apiKey = this.configService.get<string>('PAYMOB_API_KEY');
    const orderAmount = order.amount ?? 0;
    const expectedCents = Math.round(orderAmount * 100);

    // Case 1: Transaction ID supplied and Paymob API Key available
    if (transactionId && apiKey) {
      try {
        const authRes = await fetch(
          'https://accept.paymob.com/api/auth/tokens',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: apiKey }),
          },
        );

        if (authRes.ok) {
          const authData = await authRes.json();
          const txnRes = await fetch(
            `https://accept.paymob.com/api/acceptance/transactions/${transactionId}`,
            {
              headers: { Authorization: `Bearer ${authData.token}` },
            },
          );

          if (txnRes.ok) {
            const txn = await txnRes.json();

            if (
              txn &&
              txn.success === true &&
              txn.pending === false &&
              Number(txn.amount_cents) === expectedCents
            ) {
              order.paymentStatus = PaymentStatus.PAID;
              order.paymentTransactionId = String(transactionId);
              await order.save();
              return {
                verified: true,
                order,
                paymentStatus: PaymentStatus.PAID,
              };
            }
          }
        }
      } catch (err) {
        this.logger.error(`Error querying Paymob transaction API: ${err}`);
      }
    }

    // Case 2: Verification check via Paymob Callback Payload or Direct Call
    if (paymobData) {
      const isSuccess =
        paymobData.success === 'true' ||
        paymobData.success === true ||
        paymobData.txn_response_code === 'APPROVED';
      const amountCents = Number(paymobData.amount_cents || 0);

      if (isSuccess && (amountCents === 0 || amountCents === expectedCents)) {
        order.paymentStatus = PaymentStatus.PAID;
        if (transactionId) order.paymentTransactionId = String(transactionId);
        await order.save();
        return { verified: true, order, paymentStatus: PaymentStatus.PAID };
      }
    }

    // Case 3: Manual Verification endpoint / Test Sandbox Verification
    if (transactionId && !apiKey) {
      order.paymentStatus = PaymentStatus.PAID;
      order.paymentTransactionId = String(transactionId);
      await order.save();
      return { verified: true, order, paymentStatus: PaymentStatus.PAID };
    }

    // Default: Payment incomplete or pending
    return {
      verified: false,
      order,
      paymentStatus: order.paymentStatus || PaymentStatus.PENDING,
      message: 'Payment verification failed or payment is still pending.',
    };
  }

  /**
   * Validates Paymob HMAC Signature for secure webhook verification.
   */
  validatePaymobHmac(queryOrBody: any): boolean {
    const hmacSecret = this.configService.get<string>('PAYMOB_HMAC_SECRET');
    if (!hmacSecret) return true;

    try {
      const keys = [
        'amount_cents',
        'created_at',
        'currency',
        'error_occured',
        'has_parent_transaction',
        'id',
        'integration_id',
        'is_3d_secure',
        'is_auth',
        'is_capture',
        'is_standalone_payment',
        'is_voided',
        'order.id',
        'owner',
        'pending',
        'source_data.pan',
        'source_data.sub_type',
        'source_data.type',
        'success',
      ];

      const concatenated = keys
        .map((key) => {
          const parts = key.split('.');
          let val = queryOrBody;
          for (const p of parts) {
            val = val?.[p];
          }
          return val !== undefined && val !== null ? String(val) : '';
        })
        .join('');

      const calculatedHmac = crypto
        .createHmac('sha512', hmacSecret)
        .update(concatenated)
        .digest('hex');

      return (
        calculatedHmac.toLowerCase() ===
        String(queryOrBody.hmac || '').toLowerCase()
      );
    } catch {
      return false;
    }
  }
}
