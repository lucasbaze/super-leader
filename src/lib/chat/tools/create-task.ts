import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { dateHandler } from '@/lib/dates/helpers';
import { TASK_TYPES, TaskType } from '@/lib/tasks/task-types';
import { createTask } from '@/services/tasks/create-task';
import { CreateTaskServiceResult, TaskContent, taskContentSchema } from '@/services/tasks/types';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, TToolError } from '../utils';

// TODO: Clean up this duplication with `taskSuggestionSchema`
const createTaskParametersSchema = z.object({
  person_id: z.string().min(1).describe('The ID of the person the task is associated with'),
  type: z.enum(Object.values(TASK_TYPES) as [TaskType, ...TaskType[]]).describe('The type of task'),
  content: taskContentSchema,
  end_at: z.string().describe('The ISO date-time string when the task should be completed')
});

export const createTaskTool: ChatTool<
  {
    person_id: string;
    type: TaskType;
    action: string;
    context: string;
    suggestion: string;
    end_at: string;
  },
  CreateTaskServiceResult['data'] | TToolError
> = {
  name: 'createTask',
  displayName: 'Create Task',
  description: 'Create a new task or reminder',
  rulesForAI: stripIndents`\
    ## createTask Guidelines
    
    - Use createTask to create new task reminders for the user
    - Before creating a task, you should ask the user for details about the task:
      - What the task is about
      - When the task should be completed
      - How important the task is
    
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
    
    - Priority levels:
      - High: Critical tasks that need immediate attention
      - Medium: Important but not urgent tasks
      - Low: Nice-to-have tasks with flexible timing
    
    - All tasks 
      - Use "requested-reminder" for any task that the user has requested. This is the default type and should be used for most tasks.
      - Use "birthday-reminder" specifically for birthday-related tasks
  `,
  parameters: z.object({
    person_id: z.string().min(1).describe('The ID of the person the task is associated with'),
    type: z
      .enum(Object.values(TASK_TYPES) as [TaskType, ...TaskType[]])
      .describe('The type of task'),
    action: z.string().describe('A brief action label for the task (2-5 words)'),
    context: z.string().describe('Context about the task (1 sentence max)'),
    suggestion: z.string().describe('Specific suggestion for completing the task (1 sentence max)'),
    end_at: z.string().describe('The date-time string when the task should be completed')
  }),
  execute: async (db, { person_id, type, action, context, suggestion, end_at }, { userId }) => {
    console.log('Creating task for:', person_id, type, action, context, suggestion, end_at);

    try {
      const validationResult = createTaskParametersSchema.safeParse({
        person_id,
        type,
        content: {
          action,
          context,
          suggestion
        },
        end_at
      });

      if (validationResult.error) {
        throw validationResult.error;
      }

      const result = await createTask({
        db,
        task: {
          userId,
          personId: person_id,
          type,
          content: {
            action,
            context,
            suggestion
          },
          endAt: end_at
        }
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
  onSuccessEach: false,
  onSuccess: ({ queryClient, args }) => {
    console.log('Invalidating queries for:', args);
    // queryClient.invalidateQueries({ queryKey: ['person-activity', args.person_id] });
    // queryClient.invalidateQueries({ queryKey: ['person', args.person_id] });
  }
};
