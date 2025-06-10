import { AuthStatus } from '@/types/custom';

export const integrationUIStatuses = {
  CONNECTED: 'CONNECTED',
  NEEDS_RECONNECTION: 'NEEDS_RECONNECTION',
  DISABLED: 'DISABLED',
  PROCESSING: 'PROCESSING',
  UNCONNECTED: 'UNCONNECTED'
} as const;

export type IntegrationUIStatus = (typeof integrationUIStatuses)[keyof typeof integrationUIStatuses];

export function mapAuthStatusToUIStatus(authStatus: AuthStatus): IntegrationUIStatus {
  switch (authStatus) {
    case 'OK':
    case 'CREATION_SUCCESS':
    case 'RECONNECTED':
    case 'SYNC_SUCCESS':
      return 'CONNECTED';
    case 'CREDENTIALS':
    case 'ERROR':
      return 'NEEDS_RECONNECTION';
    case 'STOPPED':
    case 'DELETED':
      return 'DISABLED';
    case 'CONNECTING':
      return 'PROCESSING';
    default:
      return 'UNCONNECTED';
  }
}
