import { ActionCard, ActionCardProps } from '@/components/chat/cards/action-card';

// Define a strict mapping of tool names to components
export const toolComponents = {
  createPerson: (props: ActionCardProps) => <ActionCard {...props} />
};
