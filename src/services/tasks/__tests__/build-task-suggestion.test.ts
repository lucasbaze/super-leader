import { addDays, subDays } from 'date-fns';

import { TASK_TYPES } from '@/lib/tasks/task-types';

import { buildTaskSuggestion, ERRORS } from '../build-task-suggestion';

describe('buildTaskSuggestion', () => {
  const validInput = {
    userId: 'user-123',
    personId: 'person-123',
    type: TASK_TYPES.BIRTHDAY_REMINDER,
    content: {
      action: 'Send birthday wishes',
      context: 'Birthday coming up',
      suggestion: 'Send a thoughtful message'
    },
    endAt: addDays(new Date(), 1).toISOString()
  };

  describe('success cases', () => {
    it('should return valid task suggestion with all valid inputs', () => {
      const result = buildTaskSuggestion(validInput);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.data).toMatchObject({
        user_id: validInput.userId,
        person_id: validInput.personId,
        type: validInput.type,
        content: validInput.content,
        end_at: validInput.endAt
      });
    });

    it('should accept valid task suggestion without end_at', () => {
      const { endAt, ...inputWithoutEndAt } = validInput;
      const result = buildTaskSuggestion(inputWithoutEndAt);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.data?.end_at).toBeUndefined();
    });
  });

  describe('validation cases', () => {
    it('should reject invalid task type', () => {
      const result = buildTaskSuggestion({
        ...validInput,
        // @ts-expect-error
        type: 'INVALID_TYPE'
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.INVALID_TYPE);
      expect(result.data).toBeNull();
    });

    it('should reject invalid content schema', () => {
      const result = buildTaskSuggestion({
        ...validInput,
        content: {
          // @ts-expect-error - invalid content schema
          invalid: 'content'
        }
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.INVALID_CONTENT);
      expect(result.data).toBeNull();
    });

    it('should reject end_at date in the past', () => {
      const result = buildTaskSuggestion({
        ...validInput,
        endAt: subDays(new Date(), 1).toISOString()
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.INVALID_END_DATE);
      expect(result.data).toBeNull();
    });

    it('should reject missing required fields', () => {
      const result = buildTaskSuggestion({
        ...validInput,
        userId: ''
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.MISSING_REQUIRED_FIELDS);
      expect(result.data).toBeNull();
    });
  });
});
