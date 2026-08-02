import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LoginDto, RegisterDto } from './dto/auth.dto';

import { User } from './../schemas/user.schema';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    async getProfile(req, res) {
        const token = req.headers.authorization?.split(' ')[1];
        try {
            const user = jwt.verify(token, 'somesecretkey');

            if (user._id) {
                const userData = await this.userModel.findById(user._id).select('-password -role -__v').exec();

                if (userData) {
                    return res.status(200).send(userData);
                } else {
                    return res.status(400).send({ status: 400, message: "Invalid Request" });
                }
            } else {
                return res.status(400).send({ status: 400, message: "Invalid Request" });
            }
        } catch (err) {
            return res.status(400).send({ status: 400, message: "Invalid Request" });
        }
    }

    async check(token: string, res: any) {
        try {
            const user = await this.userModel.findOne({ token }).select('-password -__v -createdAt -updatedAt').exec();

            if (user) {
                return res.status(200).send({ status: 200, message: "Authorized", data: user });
            } else {
                return res.status(200).send({ status: 401, message: "Unauthorized" });
            }

        } catch (err) {
            return res.status(401).send({ status: 401, message: "Unauthorized" });
        }
    }

    async signin(data: LoginDto, res: any) {
        if (!data.username && !data.email) {
            throw new Error('Email Or Username Must Be Provided');
        }

        const user = await this.userModel.findOne({ $or: [{ username: data.username }, { email: data.email }] }).exec();

        if (!user) {
            return res.status(400).send({ status: 400, message: "Username/Email Or Password Doesn't Match" });
        }

        const token = await jwt.sign({
            _id: user._id,
            role: user.role
        }, "somesecretkey");

        await user.updateOne({ token }).exec();

        res.cookie('accessToken', token, {
            expires: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
            httpOnly: true
        });

        return res.send({ token });
    }

    async signup(data: RegisterDto, res: any) {
        const user = await this.userModel.findOne({ $or: [{ username: data.username }, { email: data.email }] }).exec();

        if (user) {
            throw new Error("Username Or Email Already Exists");
        }

        const password = await bcrypt.hash(data.password, 10);

        const newUser = await this.userModel.create({ ...data, password });

        if (newUser) {
            const token = await jwt.sign({
                _id: newUser._id,
                role: newUser.role
            }, "somesecretkey");

            await newUser.updateOne({ token }).exec();

            res.cookie('accessToken', token, {
                expires: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
                httpOnly: true
            });

            return res.send({ _id: newUser._id, token });
        }
    }
}
