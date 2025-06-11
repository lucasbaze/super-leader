import { LogoIcons } from '@/components/icons';
import { ACCOUNT_NAMES, AccountName } from '@/types/custom';

export interface IntegrationMetadata {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const INTEGRATION_METADATA: Record<AccountName, IntegrationMetadata> = {
  [ACCOUNT_NAMES.LINKEDIN]: {
    name: 'LinkedIn',
    description: 'Sync your LinkedIn connections.',
    icon: LogoIcons.LogoIcons.linkedin
  }
  // [ACCOUNT_NAMES.GOOGLE]: {
  //   name: 'Google',
  //   description: 'Sync your Google contacts.',
  //   icon: LogoIcons.LogoIcons.google
  // }
  // Add more integrations here as you expand accountNames
};
