import { DashboardStatistics } from './statistics.models';
import { RiderDutyStatus, VerificationStatus } from './rider.models';
import { ActiveDelivery, NearbyOrder } from './order.models';

export interface DashboardResponse {
  verificationStatus: VerificationStatus;
  riderStatus: RiderDutyStatus;
  statistics: DashboardStatistics;
  activeDelivery: ActiveDelivery;
  nearbyOrders: NearbyOrder[];
}
