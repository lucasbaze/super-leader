import { type ChatTools } from '@/lib/chat/chat-tools';

export type ChatVariantType = 'onboarding' | 'main';

export interface ChatConfig {
  type: ChatVariantType;
  toolRegistry: typeof ChatTools;
  chatContainerStyles?: {
    outerContainer?: string;
    midContainer?: string;
    innerContainer?: string;
  };
  messagesListStyles?: {
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
