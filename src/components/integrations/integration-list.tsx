import React from 'react';

import { AccountName, INTEGRATION_ACCOUNT_NAME } from '@/types/custom';
import { IntegratedAccount } from '@/types/database';

import { IntegrationCard } from './integration-card';
import { INTEGRATION_METADATA } from './integration-metadata';
import { IntegrationUIStatus, mapAuthStatusToUIStatus } from './integration-status';

export interface IntegrationListProps {
  integratedAccounts: IntegratedAccount[];
  onConnect: (accountName: AccountName) => void;
}

export function IntegrationList({ integratedAccounts, onConnect }: IntegrationListProps) {
  // Build a map for quick lookup
  const accountMap = React.useMemo(() => {
    const map: Partial<Record<AccountName, IntegratedAccount>> = {};
    for (const acc of integratedAccounts) {
      map[acc.account_name as AccountName] = acc;
    }
    return map;
  }, [integratedAccounts]);

  return (
    <div className='flex flex-col gap-2'>
      {Object.values(INTEGRATION_ACCOUNT_NAME).map((accountName) => {
        const meta = INTEGRATION_METADATA[accountName];
        const account = accountMap[accountName];
        let status: IntegrationUIStatus = 'UNCONNECTED' as any;
        if (account) {
          status = mapAuthStatusToUIStatus(account.auth_status as any);
        } else {
          status = 'UNCONNECTED' as any;
        }
        return (
          <IntegrationCard
            key={accountName}
            name={meta.name}
            description={meta.description}
            icon={meta.icon}
            status={status}
            onClick={() => onConnect(accountName)}
          />
        );
      })}
    </div>
  );
}
