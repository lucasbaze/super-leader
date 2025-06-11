import { AUTH_STATUS, AuthStatus } from '@/types/custom';

export const INTEGRATION_UI_STATUS = {
  CONNECTED: 'CONNECTED',
  NEEDS_RECONNECTION: 'NEEDS_RECONNECTION',
  PROCESSING: 'PROCESSING',
  UNCONNECTED: 'UNCONNECTED'
} as const;

export type IntegrationUIStatus = (typeof INTEGRATION_UI_STATUS)[keyof typeof INTEGRATION_UI_STATUS];

export function mapAuthStatusToUIStatus(authStatus: AuthStatus): IntegrationUIStatus {
  switch (authStatus) {
    case AUTH_STATUS.OK:
    case AUTH_STATUS.CREATION_SUCCESS:
    case AUTH_STATUS.RECONNECTED:
    case AUTH_STATUS.SYNC_SUCCESS:
      return 'CONNECTED';
    case AUTH_STATUS.STOPPED:
    case AUTH_STATUS.DELETED:
    case AUTH_STATUS.CREDENTIALS:
    case AUTH_STATUS.ERROR:
      return 'NEEDS_RECONNECTION';
    case AUTH_STATUS.CONNECTING:
      return 'PROCESSING';
    default:
      return 'UNCONNECTED';
  }
}
