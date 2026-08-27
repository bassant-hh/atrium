import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CustomerJwtGuard } from '../customer/guards/customer-jwt.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Paymob Redirect Callback (GET endpoint hit by customer browser after Paymob checkout).
   */
  @Get('callback')
  async handlePaymobCallback(@Query() query: any, @Res() res: any) {
    const orderId = query.merchant_order_id || query.order;
    const txnId = query.id;

    let verifiedStatus = 'FAILED';

    if (orderId) {
      const result = await this.paymentService.verifyPayment(
        orderId,
        txnId,
        query,
      );
      if (result.verified) {
        verifiedStatus = 'PAID';
      }
    }

    const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendOrigin}/payment-result?orderId=${orderId || ''}&status=${verifiedStatus}&txnId=${txnId || ''}`;

    return res.redirect(redirectUrl);
  }

  /**
   * Paymob Webhook Notification (POST endpoint hit directly by Paymob servers).
   */
  @Post('webhook')
  async handlePaymobWebhook(@Body() body: any) {
    const isValidHmac = this.paymentService.validatePaymobHmac(body);
    if (!isValidHmac) {
      return {
        status: 'rejected',
        message: 'HMAC signature verification failed.',
      };
    }

    const obj = body.obj || body;
    const orderId = obj?.order?.merchant_order_id;
    const txnId = obj?.id;

    if (orderId && txnId) {
      await this.paymentService.verifyPayment(orderId, String(txnId), obj);
    }

    return { status: 'acknowledged' };
  }

  /**
   * Verification endpoint callable by authenticated customer frontend.
   */
  @Post('verify/:orderId')
  @UseGuards(CustomerJwtGuard)
  async verifyCustomerPayment(
    @Param('orderId') orderId: string,
    @Body('transactionId') transactionId?: string,
  ) {
    return this.paymentService.verifyPayment(orderId, transactionId);
  }
}
