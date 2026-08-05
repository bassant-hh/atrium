import { IsIn, IsNotEmpty } from 'class-validator';
import { RiderDutyStatus } from '../enums/rider-duty-status.enum';

export class UpdateDutyStatusDto {
  @IsNotEmpty()
  @IsIn(['OFFLINE', 'ONLINE', 'BUSY', 'DELIVERING', 'UNAVAILABLE'], {
    message:
      'status must be a valid RiderDutyStatus value (OFFLINE, ONLINE, BUSY, DELIVERING, UNAVAILABLE)',
  })
  status: RiderDutyStatus;
}
