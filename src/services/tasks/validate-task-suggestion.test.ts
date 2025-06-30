import { addDays, subDays } from 'date-fns';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';

import { ERRORS, validateTaskSuggestion } from './validate-task-suggestion';

describe('validateTaskSuggestion', () => {
  const validInput = {
    userId: 'user-123',
    personId: 'person-123',
    trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
    context: {
      context: 'Birthday coming up next week',
      callToAction: 'Send a thoughtful birthday message'
    },
    suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
    suggestedAction: {
      messageVariants: [
        {
          tone: 'friendly',
          message: 'Happy birthday! Hope you have a fantastic day!'
        },
        {
          tone: 'professional',
          message: 'Wishing you a wonderful birthday and a great year ahead.'
        }
      ]
    },
    endAt: addDays(new Date(), 1).toISOString()
  };

  describe('success cases', () => {
    it('should return valid task suggestion with all valid inputs', () => {
      const result = validateTaskSuggestion(validInput);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.data).toMatchObject({
        user_id: validInput.userId,
        person_id: validInput.personId,
        trigger: validInput.trigger,
        context: validInput.context,
        suggested_action_type: validInput.suggestedActionType,
        suggested_action: validInput.suggestedAction,
        end_at: validInput.endAt
      });
    });

    it('should validate different action types', () => {
      // Test share content action
      const shareContentInput = {
        ...validInput,
        trigger: TASK_TRIGGERS.EXTERNAL_NEWS.slug,
        context: {
          context: 'Found an interesting article about their interests',
          callToAction: 'Share the article about AI developments'
        },
        suggestedActionType: SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug,
        suggestedAction: {
          contentVariants: [
            {
              suggestedContent: {
                title: 'Latest AI Developments',
                description: 'An article about recent breakthroughs in AI',
                url: 'https://example.com/ai-article'
              },
              messageVariants: [
                {
                  tone: 'professional',
                  message: 'Thought you might find this interesting given your work in AI'
                }
              ]
            }
          ]
        }
      };

      const shareResult = validateTaskSuggestion(shareContentInput);
      expect(shareResult.valid).toBe(true);
      expect(shareResult.error).toBeNull();

      // Test add note action
      const addNoteInput = {
        ...validInput,
        trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
        context: {
          context: 'Need to gather more information about their interests',
          callToAction: 'Ask about their favorite hobbies'
        },
        suggestedActionType: SUGGESTED_ACTION_TYPES.ADD_NOTE.slug,
        suggestedAction: {
          questionVariants: [
            {
              type: 'personal',
              question: 'What are your favorite hobbies?'
            }
          ]
        }
      };

      const noteResult = validateTaskSuggestion(addNoteInput);
      expect(noteResult.valid).toBe(true);
      expect(noteResult.error).toBeNull();

      // Test buy gift action
      const buyGiftInput = {
        ...validInput,
        trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
        context: {
          context: 'Birthday coming up, likes tech gadgets',
          callToAction: 'Buy a thoughtful birthday gift'
        },
        suggestedActionType: SUGGESTED_ACTION_TYPES.BUY_GIFT.slug,
        suggestedAction: {
          suggestedGifts: [
            {
              title: 'Smart Watch',
              reason: 'They mentioned being interested in fitness tracking',
              url: 'https://example.com/smart-watch',
              type: 'nice'
            }
          ]
        }
      };

      const giftResult = validateTaskSuggestion(buyGiftInput);
      expect(giftResult.valid).toBe(true);
      expect(giftResult.error).toBeNull();
    });
  });

  describe('validation cases', () => {
    it('should reject invalid trigger', () => {
      const result = validateTaskSuggestion({
        ...validInput,
        // @ts-ignore
        trigger: 'INVALID_TRIGGER'
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.INVALID_TRIGGER);
      expect(result.data).toBeNull();
    });

    it('should reject invalid context schema', () => {
      const result = validateTaskSuggestion({
        ...validInput,
        context: {
          invalid: 'content'
        } as any
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.INVALID_CONTEXT);
      expect(result.data).toBeNull();
    });

    it('should reject invalid action type', () => {
      const result = validateTaskSuggestion({
        ...validInput,
        // @ts-expect-error
        suggestedActionType: 'INVALID_ACTION'
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.INVALID_ACTION_TYPE);
      expect(result.data).toBeNull();
    });

    it('should reject invalid action schema', () => {
      const result = validateTaskSuggestion({
        ...validInput,
        suggestedAction: {
          invalid: 'action'
        } as any
      });

      expect(result.valid).toBe(false);
      expect(result.error?.displayMessage).toEqual(ERRORS.TASK_SUGGESTION.INVALID_ACTION.displayMessage);
      expect(result.data).toBeNull();
    });

    it('should reject end_at date in the past', () => {
      const result = validateTaskSuggestion({
        ...validInput,
        endAt: subDays(new Date(), 1).toISOString()
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.INVALID_END_DATE);
      expect(result.data).toBeNull();
    });

    it('should reject missing required fields', () => {
      const result = validateTaskSuggestion({
        ...validInput,
        userId: ''
      });

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(ERRORS.TASK_SUGGESTION.MISSING_REQUIRED_FIELDS);
      expect(result.data).toBeNull();
    });
  });
});
