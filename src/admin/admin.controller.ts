import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** GET /admin/riders/pending */
  @Get('riders/pending')
  getPendingRiders(): Promise<User[]> {
    return this.adminService.getPendingRiders();
  }

  /** GET /admin/riders */
  @Get('riders')
  getAllRiders(): Promise<User[]> {
    return this.adminService.getAllRiders();
  }

  /** PATCH /admin/riders/:id/approve */
  @Patch('riders/:id/approve')
  approveRider(@Param('id') id: string): Promise<User> {
    return this.adminService.approveRider(id);
  }

  /** PATCH /admin/riders/:id/reject */
  @Patch('riders/:id/reject')
  rejectRider(@Param('id') id: string): Promise<User> {
    return this.adminService.rejectRider(id);
  }
}
