import { VerificationStatus } from '../enums/verification-status.enum';
import { RiderDutyStatus } from '../enums/rider-duty-status.enum';

export class RiderStatusResponseDto {
  verificationStatus: VerificationStatus;
  riderStatus: RiderDutyStatus;
}
