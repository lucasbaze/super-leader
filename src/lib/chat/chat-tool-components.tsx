import { ReactNode } from 'react';

import { ActionCard, ActionCardProps } from '@/components/chat-next/cards/action-card';

// Define a strict mapping of tool names to components
export const toolComponents = {
  createPerson: (props: ActionCardProps) => <ActionCard {...props} />
};
