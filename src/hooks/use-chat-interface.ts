import { useCallback, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Message, ToolCall } from 'ai';
import { useChat } from 'ai/react';

import { useCreateMessage } from '@/hooks/use-messages';
import { ChatParams } from '@/lib/chat/chat-params-factory';
import { CHAT_TOOLS, ChatTools } from '@/lib/chat/chat-tools';
import { $user } from '@/lib/llm/messages';
import { MESSAGE_TYPE, TMessageType } from '@/lib/messages/constants';

interface UseChatInterfaceProps {
  apiEndpoint: string;
  chatParams: ChatParams;
  chatType: string;
  chatId: string;
  personId?: string;
  groupId?: string;
  extraBody?: Record<string, any>;
}

export type PendingAction = {
  type: string;
  name: string;
  arguments: any;
  toolCallId: string;
} | null;

const getMessageParams = (type: TMessageType, id: string) => {
  if (type === MESSAGE_TYPE.PERSON) {
    return {
      type,
      personId: id
    };
  } else if (type === MESSAGE_TYPE.GROUP) {
    return {
      type,
      groupId: id
    };
  } else {
    return {
      type
    };
  }
};

export function useChatInterface({
  apiEndpoint,
  chatParams,
  chatType,
  chatId,
  personId,
  groupId,
  extraBody = {}
}: UseChatInterfaceProps) {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [toolsCalled, setToolsCalled] = useState<ToolCall<string, unknown>[]>([]);
  const [chatFinished, setChatFinished] = useState(false);

  const createMessage = useCreateMessage();

  const chatInterface = useChat({
    api: apiEndpoint,
    initialMessages: [],
    id: chatParams.id,
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
      if (chatParams.id) {
        await createMessage.mutateAsync({
          type: chatParams.type,
          ...(chatParams.personId && { personId: chatParams.personId }),
          ...(chatParams.groupId && { groupId: chatParams.groupId }),
          message: result
        });
      }
    }
  });

  // This handles the saving of tool call messages after the chat is finished
  useEffect(() => {
    if (chatFinished && toolsCalled.length > 0) {
      toolsCalled.forEach((toolCall) => {
        const tool = ChatTools.get(toolCall.toolName);
        if (tool?.onSuccess) {
          tool.onSuccess({ queryClient, args: toolCall.args });
        }
      });

      const saveAllMessages = async (messagesToSave: (Message | undefined)[]) => {
        if (!messagesToSave) return;
        await Promise.all(
          messagesToSave.map((msg) => {
            if (!msg) return;
            return createMessage.mutateAsync({
              // Change to create a "builder" message that handles this silliness
              ...getMessageParams(chatType, chatId),
              message: msg
            });
          })
        );
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
  }, [chatFinished, toolsCalled, queryClient, chatInterface]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!chatInterface.input.trim()) return;

      const messageContent = chatInterface.input;
      chatInterface.setInput('');

      if (chatParams.id) {
        await createMessage.mutateAsync({
          type: chatParams.type,
          ...(chatParams.personId && { personId: chatParams.personId }),
          ...(chatParams.groupId && { groupId: chatParams.groupId }),
          message: $user(messageContent)
        });
      }

      await chatInterface.append({
        content: messageContent,
        role: 'user'
      });
    },
    [chatInterface, chatParams, createMessage]
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
