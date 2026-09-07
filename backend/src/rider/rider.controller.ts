import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-payload.interface';
import { RiderService } from './rider.service';
import { RiderStatusResponseDto } from './dto/rider-status-response.dto';
import { UpdateDutyStatusDto } from './dto/update-duty-status.dto';

@Controller('rider')
@UseGuards(JwtAuthGuard)
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @Get('status')
  async getStatus(
    @Request() req: { user: JwtUserPayload },
  ): Promise<RiderStatusResponseDto> {
    return this.riderService.getRiderStatus(req.user._id);
  }

  @Patch('status')
  async updateStatus(
    @Request() req: { user: JwtUserPayload },
    @Body() dto: UpdateDutyStatusDto,
  ): Promise<RiderStatusResponseDto> {
    return this.riderService.updateDutyStatus(req.user._id, dto);
  }

  @Post('heartbeat')
  async recordHeartbeat(
    @Request() req: { user: JwtUserPayload },
  ): Promise<{ success: boolean; riderStatus: string }> {
    return this.riderService.recordHeartbeat(req.user._id);
  }
}
