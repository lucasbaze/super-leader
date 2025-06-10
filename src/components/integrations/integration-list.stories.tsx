import React from 'react';

import { accountNames } from '@/types/custom';
import { IntegratedAccount } from '@/types/database';

import { IntegrationList } from './integration-list';

export default {
  title: 'Integrations/IntegrationList',
  component: IntegrationList,
  parameters: { layout: 'centered' }
};

const onConnect = (accountName: string) => alert(`Connect ${accountName}`);

const baseAccount = {
  account_id: 'id1',
  account_name: accountNames.LINKEDIN,
  account_status: 'ACTIVE',
  auth_status: 'OK',
  created_at: '',
  id: 'id1',
  updated_at: '',
  user_id: 'user1'
};

export const AllUnconnected = () => <IntegrationList integratedAccounts={[]} onConnect={onConnect} />;

export const Connected = () => (
  <IntegrationList integratedAccounts={[{ ...baseAccount, auth_status: 'OK' }]} onConnect={onConnect} />
);

export const Processing = () => (
  <IntegrationList integratedAccounts={[{ ...baseAccount, auth_status: 'CONNECTING' }]} onConnect={onConnect} />
);

export const NeedsReconnection = () => (
  <IntegrationList integratedAccounts={[{ ...baseAccount, auth_status: 'CREDENTIALS' }]} onConnect={onConnect} />
);

export const Disabled = () => (
  <IntegrationList integratedAccounts={[{ ...baseAccount, auth_status: 'STOPPED' }]} onConnect={onConnect} />
);
