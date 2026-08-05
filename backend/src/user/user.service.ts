import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';

import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User, UserDocument } from './../schemas/user.schema';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  private generateToken(payload: { _id: unknown; role: string }): string {
    const secret =
      this.configService.get<string>('JWT_SECRET') ?? 'somesecretkey';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  async getProfile(userId: string, res: Response) {
    try {
      const userData = await this.userModel
        .findById(userId)
        .select('-password -role -__v')
        .exec();

      if (userData) {
        return res.status(200).send(userData);
      } else {
        return res
          .status(400)
          .send({ status: 400, message: 'Invalid Request' });
      }
    } catch {
      return res.status(400).send({ status: 400, message: 'Invalid Request' });
    }
  }

  async signin(data: LoginDto, res: Response) {
    if (!data.username && !data.email) {
      throw new Error('Email Or Username Must Be Provided');
    }

    const user = await this.userModel
      .findOne({ $or: [{ username: data.username }, { email: data.email }] })
      .exec();

    if (!user) {
      return res.status(401).send({
        status: 401,
        message: "Username/Email Or Password Doesn't Match",
      });
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      return res.status(401).send({
        status: 401,
        message: "Username/Email Or Password Doesn't Match",
      });
    }

    const token = this.generateToken({
      _id: user._id,
      role: user.role,
    });

    await user.updateOne({ token }).exec();

    return res.send({
      token,
      _id: user._id,
      role: user.role,
      status: user.status,
    });
  }

  async signup(data: RegisterDto, res: Response) {
    const user = await this.userModel
      .findOne({ $or: [{ username: data.username }, { email: data.email }] })
      .exec();

    if (user) {
      throw new Error('Username Or Email Already Exists');
    }

    const password = await bcrypt.hash(data.password, 10);

    const newUser = await this.userModel.create({ ...data, password });

    if (newUser) {
      const token = this.generateToken({
        _id: newUser._id,
        role: newUser.role,
      });

      await newUser.updateOne({ token }).exec();

      return res.send({
        _id: newUser._id,
        token,
        role: newUser.role,
        status: newUser.status,
      });
    }
  }
}
