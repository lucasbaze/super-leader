import React from 'react';

import { INTEGRATION_UI_STATUS, IntegrationUIStatus } from './integration-status';

export interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: IntegrationUIStatus;
  onClick?: () => void;
  disconnected?: boolean; // If true, show 'Enable' for DISABLED
}

const statusLabel: Record<IntegrationUIStatus, string> = {
  UNCONNECTED: 'Unconnected',
  CONNECTED: 'Connected',
  NEEDS_RECONNECTION: 'Needs Reconnection',
  PROCESSING: 'Processing...'
};

function getActionLabel(status: IntegrationUIStatus, disconnected?: boolean) {
  if (status === INTEGRATION_UI_STATUS.CONNECTED) return 'Manage';
  if (status === INTEGRATION_UI_STATUS.PROCESSING) return 'Processing...';
  if (status === INTEGRATION_UI_STATUS.NEEDS_RECONNECTION) return 'Reconnect';
  // UNCONNECTED or fallback
  return 'Connect';
}

function getActionColor(status: IntegrationUIStatus, disconnected?: boolean) {
  if (status === INTEGRATION_UI_STATUS.CONNECTED) return 'bg-gray-300 text-gray-600 cursor-default';
  if (status === INTEGRATION_UI_STATUS.PROCESSING) return 'bg-blue-400 text-white';
  if (status === INTEGRATION_UI_STATUS.NEEDS_RECONNECTION) return 'bg-yellow-600 hover:bg-yellow-700 text-white';
  // UNCONNECTED or fallback
  return 'bg-green-600 hover:bg-green-700 text-white';
}

function getLabelColor(status: IntegrationUIStatus, disconnected?: boolean) {
  if (status === INTEGRATION_UI_STATUS.CONNECTED) return 'bg-green-100 text-green-700';
  if (status === INTEGRATION_UI_STATUS.PROCESSING) return 'bg-blue-100 text-blue-700';
  if (status === INTEGRATION_UI_STATUS.NEEDS_RECONNECTION) return 'bg-yellow-100 text-yellow-800';
  // UNCONNECTED or fallback
  return 'bg-gray-200 text-gray-500';
}

export function IntegrationCard({
  name,
  description,
  icon: Icon,
  status,
  onClick,
  disconnected
}: IntegrationCardProps) {
  return (
    <div
      className={`mb-3 flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm transition-opacity hover:shadow-md`}
      aria-disabled={false}>
      <div className='flex items-center gap-4'>
        <span className='rounded bg-gray-100 p-2'>
          <Icon className='size-7 text-gray-700' />
        </span>
        <div>
          <div className='text-base font-medium text-gray-900'>{name}</div>
          <div className='text-sm text-gray-500'>{description}</div>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        {status !== INTEGRATION_UI_STATUS.UNCONNECTED && (
          <span className={`rounded px-2 py-1 text-xs font-semibold ${getLabelColor(status, disconnected)}`}>
            {statusLabel[status]}
          </span>
        )}
        {status !== INTEGRATION_UI_STATUS.CONNECTED && (
          <button
            type='button'
            onClick={onClick}
            className={`ml-2 rounded px-3 py-1 text-sm font-medium transition-colors ${getActionColor(status, disconnected)}`}
            aria-label={getActionLabel(status, disconnected)}>
            {getActionLabel(status, disconnected)}
          </button>
        )}
      </div>
    </div>
  );
}
