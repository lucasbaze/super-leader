import { useCallback, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Message, ToolCall } from 'ai';
import { useChat } from 'ai/react';

import { useCreateMessage } from '@/hooks/use-messages';
import { CHAT_TOOLS, ChatTools } from '@/lib/chat/chat-tools';
import { $user } from '@/lib/llm/messages';

interface UseChatInterfaceProps {
  apiEndpoint: string;
  conversationId: string | null;
  extraBody?: Record<string, any>;
}

export type PendingAction = {
  type: string;
  name: string;
  arguments: any;
  toolCallId: string;
} | null;

export function useChatInterface({
  apiEndpoint,
  conversationId,
  extraBody = {}
}: UseChatInterfaceProps) {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [toolsCalled, setToolsCalled] = useState<ToolCall<string, unknown>[]>([]);
  const [chatFinished, setChatFinished] = useState(false);
  const createMessage = useCreateMessage({});

  const chatInterface = useChat({
    api: apiEndpoint,
    initialMessages: [],
    id: conversationId || undefined,
    body: extraBody,
    onError: (error) => {
      chatInterface.setMessages((messages) => [
        ...messages,
        {
          id: 'error',
          role: 'assistant',
          content: 'Hmm... An error occurred. Please try again.',
          error: error
        }
      ]);
    },
    onToolCall: async ({ toolCall }) => {
      console.log('Tool Called:', toolCall);
      setToolsCalled((prevActions) => {
        const tool = ChatTools.get(toolCall.toolName);
        const shouldCallEachTime = tool?.onSuccessEach ?? false;

        if (
          shouldCallEachTime ||
          !prevActions.some((call) => call.toolName === toolCall.toolName)
        ) {
          return [...prevActions, toolCall];
        }
        return prevActions;
      });

      if (toolCall.toolName === CHAT_TOOLS.GET_PERSON_SUGGESTIONS) {
        return;
      }

      setPendingAction({
        type: 'function',
        name: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        arguments: toolCall.args
      });
    },
    onFinish: async (result) => {
      setChatFinished(true);
      if (conversationId) {
        await createMessage.mutateAsync({
          conversationId,
          message: result
        });
      }
    }
  });

  // This handles the saving of tool call messages after the chat is finished
  useEffect(() => {
    if (chatFinished && toolsCalled.length > 0 && conversationId) {
      toolsCalled.forEach((toolCall) => {
        const tool = ChatTools.get(toolCall.toolName);
        if (tool?.onSuccess) {
          tool.onSuccess({ queryClient, args: toolCall.args });
        }
      });

      const saveAllMessages = async (messagesToSave: (Message | undefined)[]) => {
        if (!messagesToSave) return;
        // Save messages sequentially with a small delay to ensure unique timestamps
        for (const msg of messagesToSave) {
          if (!msg) continue;
          await createMessage.mutateAsync({
            conversationId,
            message: msg
          });
          // Add 10ms delay between saves to ensure unique timestamps
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      };
      // Save all unsaved messages
      // Get all unsaved messages that need to be persisted
      const messagesToSave = toolsCalled.map((tool) =>
        chatInterface.messages.find((msg) =>
          msg.toolInvocations?.some((invocation) => invocation.toolCallId === tool.toolCallId)
        )
      );
      console.log('messagesToSave', messagesToSave);

      // Save all unsaved messages
      saveAllMessages(messagesToSave);

      // Reset states
      setToolsCalled([]);
      setChatFinished(false);
    }
  }, [chatFinished, toolsCalled, queryClient, chatInterface, conversationId]);

  // Handle submitting a message
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const messageContent = chatInterface.input;
      if (!messageContent.trim()) return;

      // Add the user message to the UI immediately
      chatInterface.append({
        id: Date.now().toString(),
        content: messageContent,
        role: 'user',
        createdAt: new Date()
      });

      // Clear the input
      chatInterface.setInput('');

      // Save the user message to the database
      if (conversationId) {
        await createMessage.mutateAsync({
          message: $user(messageContent),
          conversationId
        });
      }
    },
    [chatInterface, createMessage, conversationId]
  );

  return {
    ...chatInterface,
    handleSubmit,
    pendingAction,
    setPendingAction,
    chatFinished,
    toolsCalled
  };
}
