import { LogoIcons } from '@/components/icons';
import { AccountName, accountNames } from '@/types/custom';

export interface IntegrationMetadata {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const INTEGRATION_METADATA: Record<AccountName, IntegrationMetadata> = {
  [accountNames.LINKEDIN]: {
    name: 'LinkedIn',
    description: 'Sync your LinkedIn connections.',
    icon: LogoIcons.LogoIcons.linkedin
  }
  // Add more integrations here as you expand accountNames
};
