import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import jwt from 'jsonwebtoken';

import { Order } from './../schemas/order.schema';

@Injectable()
export class OrderService {
    constructor(@InjectModel(Order.name) private orderModel: Model<Order>) { }

    async getAll(req: any, res: any) {
        const token = req.headers.authorization?.split(' ')[1];
        const userData = jwt.verify(token, 'somesecretkey');

        if (userData && userData._id) {
            const orders = await this.orderModel.find({ clientId: userData._id }).exec();

            if (orders) {
                return res.status(200).send({ message: "Orders Retrived Successfully", status: 200 });
            }
        }

        return res.status(400).send({ message: "Invalid Request", status: 400 });
    }
}
