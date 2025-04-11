import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { dateHandler } from '@/lib/dates/helpers';
import { TASK_TRIGGERS, TaskTrigger } from '@/lib/tasks/constants';
import { buildTask } from '@/services/tasks/build-task';
import { BuildTaskServiceResult } from '@/services/tasks/types';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

const createTaskParametersSchema = z.object({
  person_id: z.string().min(1).describe('The ID of the person the task is associated with'),
  context: z.string().describe('Context about the task requested by the user'),
  end_at: z.string().datetime().describe('The ISO date-time string when the task should be completed')
});

export const createTaskTool: ChatTool<
  {
    person_id: string;
    context: string;
    end_at: string;
  },
  BuildTaskServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.CREATE_TASK,
  displayName: 'Create Task',
  description: 'Create a new task or reminder',
  rulesForAI: stripIndents`\
    ## createTask Guidelines
    
    - Use createTask to create new task reminders for the user
    - Before creating a task, you should ask the user for details about the task:
      - What the task is about
      - When the task should be completed
    
    - When interpreting dates, be intelligent about relative dates:
      - "Next week" on a Tuesday should target the following Monday
      - "Tomorrow" should be exactly 1 day from today
      - "Next month" should be about 30 days from today
      - For important tasks, suggest a slightly earlier due date to give the user buffer time
    
      The current date is: ${dateHandler().toISOString()}
    
    - Always convert user's natural language due dates to an ISO date-time string
    - If the user wants to create a task for a specific time, include both the date and time in ISO format
    - If no specific time is mentioned, default to 9:00 AM in the user's timezone
    
    - Ask clarifying questions if the task description is vague
    - Always seek to understand the priority and context of the task
    
    Determine the priority of the task based on the context and due date:
    - Priority levels:
      - High: Critical tasks that need immediate attention
      - Medium: Important but not urgent tasks
      - Low: Nice-to-have tasks with flexible timing
  `,
  parameters: z.object({
    person_id: z.string().min(1).describe('The ID of the person the task is associated with'),
    context: z.string().describe('Context about the task (1 sentence max)'),
    end_at: z.string().describe('The date-time string when the task should be completed')
  }),
  // Thought: Maybe... the chat could supplement the context so we don't have to call the LLM again downstream within buildTask?
  // Thought... is there a "simple task" that's just a context and a due date?
  execute: async (db, { person_id, context, end_at }, { userId }) => {
    console.log('Creating task for:', person_id, context, end_at);

    const endAt = dateHandler(end_at).toISOString();

    try {
      const validationResult = createTaskParametersSchema.safeParse({
        person_id,
        context,
        end_at: endAt
      });

      if (validationResult.error) {
        throw validationResult.error;
      }

      const result = await buildTask({
        db,
        userId,
        personId: person_id,
        trigger: TASK_TRIGGERS.USER_REQUESTED_REMINDER.slug,
        context,
        endAt
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Creating task API error: Error catcher:', error);
      return handleToolError(error, 'create task');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient, args }) => {
    console.log('Create Tasks: Invalidating queries for:', args);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }
};
