import { useCallback, useEffect, useState } from 'react';

import { Message, ToolCall } from 'ai';
import { useChat } from 'ai/react';

import { useCreateMessage } from '@/hooks/use-messages';
import { CHAT_TOOLS, ChatTools } from '@/lib/chat/chat-tools';
import { $user } from '@/lib/llm/messages';
import { Conversation } from '@/types/database';

import { useSaveAssistantMessages } from './use-save-assistant-messages';

interface UseChatInterfaceProps {
  conversationId: string | null;
  handleCreateConversation: ({ title }: { title: string }) => Promise<Conversation>;
  extraBody?: Record<string, any>;
  apiRoute?: string;
}

export type PendingAction = {
  type: string;
  name: string;
  arguments: any;
  toolCallId: string;
} | null;

export function useChatInterface({
  conversationId,
  handleCreateConversation,
  extraBody = {},
  apiRoute = '/api/chat'
}: UseChatInterfaceProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [toolsCalled, setToolsCalled] = useState<ToolCall<string, unknown>[]>([]);
  const [chatFinished, setChatFinished] = useState(false);
  const [resultingMessage, setResultingMessage] = useState<Message | null>(null);
  const createMessage = useCreateMessage({});
  const { saveAssistantMessages } = useSaveAssistantMessages();

  const chatInterface = useChat({
    api: apiRoute,
    initialMessages: [],
    id: conversationId || undefined,
    body: extraBody,
    onError: (error) => {
      console.log('onError', JSON.stringify(error, null, 2));
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
      console.log('onFinish', JSON.stringify(result, null, 2));
      // Call "saveMessages" method and pass in this last
      setChatFinished(true);
      setResultingMessage(result);
    }
  });

  // Resets the chat interface when the conversationId changes
  useEffect(() => {
    chatInterface.setMessages([]);
  }, [conversationId]);

  // This handles the saving of tool call messages after the chat is finished
  useEffect(() => {
    if (chatFinished && conversationId) {
      saveAssistantMessages(resultingMessage, toolsCalled, chatInterface.messages, conversationId);

      // Reset states
      setToolsCalled([]);
      setChatFinished(false);
    }
  }, [chatFinished, toolsCalled, resultingMessage, chatInterface, conversationId]);

  // Handle submitting a message
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const messageContent = chatInterface.input;
      if (!messageContent.trim()) return;

      let newConversation;
      if (!conversationId) {
        // Create a new conversation
        newConversation = await handleCreateConversation({
          title: messageContent.substring(0, 40)
        });
      }

      // // Add the user message to the after the conversation has been created
      chatInterface.append({
        id: Date.now().toString(),
        content: messageContent,
        role: 'user',
        createdAt: new Date()
      });

      // Clear the input
      chatInterface.setInput('');

      // Don't save the user message to the database if the conversation hasn't been created yet
      if (!newConversation && !conversationId) {
        return;
      }

      await createMessage.mutateAsync({
        message: $user(messageContent),
        conversationId: conversationId || newConversation?.id || ''
      });
    },
    [
      chatInterface.input,
      chatInterface.append,
      chatInterface.setInput,
      createMessage,
      conversationId
    ]
  );

  return {
    ...chatInterface,
    handleSubmit,
    pendingAction,
    setPendingAction,
    toolsCalled
  };
}
