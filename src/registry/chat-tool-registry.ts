import { z } from 'zod';

import { DBClient } from '@/types/database';

export interface ChatTool<TParams, TResult = void> {
  name: string;
  displayName: string;
  description: string;
  parameters: z.ZodType<TParams>;
  execute?: (db: DBClient, params: TParams, auth: { userId: string }) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
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
