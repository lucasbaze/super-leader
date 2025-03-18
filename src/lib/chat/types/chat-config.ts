import { type ChatTools } from '@/lib/chat/chat-tools';

export type ChatVariantType = 'onboarding' | 'standard';

export interface ChatConfig {
  type: ChatVariantType;
  toolRegistry: typeof ChatTools;
  chatContainerStyles?: {
    container?: string;
  };
  messageStyles: {
    container?: string;
    assistant?: string;
    user?: string;
    toolCall?: string;
  };
  inputStyle: 'inline' | 'bottom';
  hiddenTools?: string[];
}
