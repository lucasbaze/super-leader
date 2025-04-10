import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { DBClient } from '@/types/database';

export interface ChatTool<TParams, TResult = void> {
  name: string;
  displayName: string;
  description: string;
  rulesForAI: string;
  parameters: z.ZodType<TParams>;
  execute?: (db: DBClient, params: TParams, auth: { userId: string }) => Promise<TResult>;
  onSuccess?: ({ queryClient, args }: { queryClient: QueryClient; args: TParams }) => void;
  onSuccessEach?: boolean; // If true, the onSuccess function will be called for each tool call
}

export function createChatToolRegistry() {
  const tools = new Map<string, ChatTool<any, any>>();

  return {
    register<TParams, TResult>(tool: ChatTool<TParams, TResult>) {
      tools.set(tool.name, tool);
    },
    get(name: string) {
      return tools.get(name) ?? null;
    },
    list() {
      return Array.from(tools.keys());
    }
  };
}

export type ChatToolRegistry = ReturnType<typeof createChatToolRegistry>;
