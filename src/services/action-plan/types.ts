import { DBClient } from '@/types/database';

export interface InputAdapter<T> {
  id: string; // A unique identifier for the input adapter
  description: string; // A description of the context fragments that will be returned
  tags: string[]; // Tags to help the LLM understand the context fragments
  getContextFragments({ db, userId }: { db: DBClient; userId: string }): Promise<ContextFragment<T | null>>;
}

interface ContextFragment<T> {
  peopleIds: string[];
  data: T;
}

export type ActionAdapter = {
  slug: string;
  description: string;
  whenToUse: string;
  expectedContextToGenerateOutput: string;
  tags: string[];
};
