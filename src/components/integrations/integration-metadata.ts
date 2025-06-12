import { LogoIcons } from '@/components/icons';
import { AccountName, INTEGRATION_ACCOUNT_NAME } from '@/types/custom';

export interface IntegrationMetadata {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const INTEGRATION_METADATA: Record<AccountName, IntegrationMetadata> = {
  [INTEGRATION_ACCOUNT_NAME.LINKEDIN]: {
    name: 'LinkedIn',
    description: 'Sync your LinkedIn connections.',
    icon: LogoIcons.LogoIcons.linkedin
  }
  // [INTEGRATION_ACCOUNT_NAME.GOOGLE]: {
  //   name: 'Google',
  //   description: 'Sync your Google contacts.',
  //   icon: LogoIcons.LogoIcons.google
  // }
  // Add more integrations here as you expand accountNames
};
