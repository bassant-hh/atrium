export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  university: string;
  role: 'DELIVERY';
  idFront: string;
  idBack: string;
  status: 'PENDING';
}
