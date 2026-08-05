import {
  Controller,
  Get,
  Post,
  Body,
  Response,
  Req,
  UseGuards,
} from '@nestjs/common';

import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-payload.interface';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(
    @Req() req: ExpressRequest & { user: JwtUserPayload },
    @Response() res: ExpressResponse,
  ) {
    return this.userService.getProfile(req.user._id, res);
  }

  @Post('login')
  login(@Body() login: LoginDto, @Response() res: ExpressResponse) {
    return this.userService.signin(login, res);
  }

  @Post('register')
  register(@Body() register: RegisterDto, @Response() res: ExpressResponse) {
    return this.userService.signup(register, res);
  }
}
