export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const VerificationStatus = {
  PENDING: 'PENDING' as const,
  APPROVED: 'APPROVED' as const,
  REJECTED: 'REJECTED' as const,
};
