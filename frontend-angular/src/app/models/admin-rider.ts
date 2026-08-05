import { RiderRole, RiderStatus } from './login-response';

export interface AdminRider {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  university: string;
  idFront: string;
  idBack: string;
  status: RiderStatus;
  role: RiderRole;
}
