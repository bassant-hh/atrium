import { Controller, Get, Post, Body, Response, Request } from '@nestjs/common';

import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @Get('profile')
    profile(@Request() req, @Response() res) {
        return this.userService.getProfile(req, res);
    }

    @Get('check')
    check(@Request() req, @Response() res) {
        const token = req.cookies.accessToken;

        return this.userService.check(token, res);
    }

    @Post('login')
    login(
        @Body() login: LoginDto,
        @Response() res) {
        return this.userService.signin(login, res);
    }

    @Post('register')
    register(@Body() register: RegisterDto, @Response() res) {
        return this.userService.signup(register, res);
    }
}
