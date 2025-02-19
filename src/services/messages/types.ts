import { Json } from '@/types/database';

export type TMessageWithContent = {
  content: string;
  [key: string]: Json;
};
