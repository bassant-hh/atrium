import { Controller, Get, Request, Response } from '@nestjs/common';

import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private orderService: OrderService) { }

    @Get('orders')
    getOrders(@Request() req: any, @Response() res: any) {
        return this.orderService.getAll(req, res);
    }
}