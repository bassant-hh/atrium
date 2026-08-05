export type RiderDutyStatus =
  'OFFLINE' | 'ONLINE' | 'BUSY' | 'DELIVERING' | 'UNAVAILABLE';

export const RiderDutyStatus = {
  OFFLINE: 'OFFLINE' as const,
  ONLINE: 'ONLINE' as const,
  BUSY: 'BUSY' as const,
  DELIVERING: 'DELIVERING' as const,
  UNAVAILABLE: 'UNAVAILABLE' as const,
};
