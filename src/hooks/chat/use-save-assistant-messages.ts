import { useQueryClient } from '@tanstack/react-query';
import { Message, ToolCall } from 'ai';

import { useCreateMessage } from '@/hooks/use-messages';
import { ChatTools } from '@/lib/chat/chat-tools';
import { ChatConfig } from '@/lib/chat/types/chat-config';

interface UseSaveAssistantMessagesProps {
  chatConfig?: ChatConfig;
}

export function useSaveAssistantMessages({ chatConfig }: UseSaveAssistantMessagesProps) {
  // export function useSaveAssistantMessages({ conversationId }: UseSaveAssistantMessagesProps) {
  const queryClient = useQueryClient();
  const createMessage = useCreateMessage({});

  /**
   * Saves all messages related to a chat interaction, including tool calls and the final response
   */
  const saveAssistantMessages = async (
    finalMessage: Message | null,
    toolsCalled: ToolCall<string, unknown>[],
    messages: Message[],
    conversationId: string
  ) => {
    if (!conversationId) return;

    try {
      // 1. Process tool calls and trigger their success handlers
      if (toolsCalled.length > 0) {
        toolsCalled.forEach((toolCall) => {
          const tool = chatConfig?.toolRegistry.get(toolCall.toolName);
          if (tool?.onSuccess) {
            tool.onSuccess({ queryClient, args: toolCall.args });
          }
        });
        // 2. Save all tool call messages first
        const toolCallMessages = toolsCalled.map((tool) =>
          messages.find((msg) =>
            msg.toolInvocations?.some((invocation) => invocation.toolCallId === tool.toolCallId)
          )
        );

        // Save tool call messages sequentially with a small delay to ensure unique timestamps
        for (const msg of toolCallMessages) {
          if (!msg) continue;
          await createMessage.mutateAsync({
            conversationId,
            message: msg
          });
          // Add 10ms delay between saves to ensure unique timestamps
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      if (finalMessage) {
        // 3. Finally save the final response message
        await createMessage.mutateAsync({
          conversationId,
          message: finalMessage
        });
      }
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  };

  return { saveAssistantMessages };
}
