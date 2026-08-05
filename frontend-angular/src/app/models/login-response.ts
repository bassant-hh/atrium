export type RiderStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RiderRole = 'ADMIN' | 'CLIENT' | 'DELIVERY';

export interface LoginRider {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RiderRole;
  status: RiderStatus;
  idFront?: string;
  idBack?: string;
  phone?: string;
  university?: string;
}

export interface LoginResponse {
  token: string;
  _id: string;
  role: RiderRole;
  status: RiderStatus;
}
