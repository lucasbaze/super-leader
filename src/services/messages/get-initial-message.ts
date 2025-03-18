import { dateHandler } from '@/lib/dates/helpers';
import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { $assistant } from '@/lib/llm/messages';
import { APP_SEGMENTS, BASE_PATH, isPath } from '@/lib/routes';
import {
  CONVERSATION_OWNER_TYPES,
  ConversationOwnerType
} from '@/services/conversations/constants';
import { DBClient, Message } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error fetching data for initial messages',
    'Unable to load initial messages'
  )
};

type GetInitialMessagesParams = {
  db: DBClient;
  userId: string;
  ownerType: ConversationOwnerType;
  ownerIdentifier: string;
};

// Helper to create a standard message structure
const createMessage = (id: string, content: string): Message => ({
  id: `superleader-msg-${id}`,
  role: 'assistant',
  content: '',
  createdAt: dateHandler().toISOString(),
  toolInvocations: [],
  // @ts-ignore - TODO: Fix typing
  message: $assistant(content, id)
});

// Define initial messages for different paths
export const INITIAL_MESSAGES = {
  default: [createMessage('default', 'How can I help you?')],
  home: [
    createMessage('home-1', 'Welcome to Superleader!'),
    createMessage(
      'home-2',
      "I'm your strategic relationship manager designed to help you become a super leader."
    )
  ],
  people: [
    createMessage('people-1', 'This is where everyone Superleader is tracking can be found.')
  ],
  network: [
    createMessage(
      'network-1',
      "What good is a goal if you don't track it and see your performance over time?"
    ),
    createMessage(
      'network-2',
      'Superleader will give you insight into the health of your network and your activity in context with your goals.'
    )
  ],
  bookmarks: [
    createMessage('bookmarks-1', 'Sometimes you find stuff that you want to send to other folks.')
  ],
  inner5: [
    createMessage('inner5-1', 'Your Inner 5 are the 5 closest people in your life.'),
    createMessage('inner5-2', 'The people you trust the most go here. ( i.e. family, best friends)')
  ],
  central50: [
    createMessage(
      'central50-1',
      'Your Central 50 group represents the 50 people that add the most significant value to your personal & professional life.'
    ),
    createMessage('central50-2', 'We want to really make sure we are adding value to them.')
  ],
  central100: [
    createMessage(
      'central100-1',
      'Your Strategic 100 represents your broader network that you are actively & strategically nurturing.'
    ),
    createMessage('central100-2', 'You want to touch base with these folks monthly to quarterly. ')
  ],
  onboarding: [
    createMessage('onboarding-1', "Hi! I'm Superleader, your strategic relationship manager."),
    createMessage(
      'onboarding-2',
      "The first step to becoming a super leader is to understand yourself, what you offer, and where you're going."
    ),
    createMessage(
      'onboarding-3',
      'Can you tell me a little about yourself? Such as your name, where you live, and your family situation such as children, partner, pets, etc.'
    )
  ]
};

export const createGroupMessages = (groupName: string, icon: string) => [
  createMessage(
    'group-1',
    `Use this group ${icon} ${groupName} to help you organize your relationships in the ways that make sense to you.`
  ),
  createMessage('group-2', 'You can add folks through chat or via the UI.')
];

export const createPersonMessages = (firstName: string) => [
  createMessage(
    'person-1',
    'Superleader keeps track of a separate conversation in context with each person.'
  ),
  createMessage(
    'person-2',
    `In this chat for ${firstName}, you can take notes, ask for content suggestions, add to groups, etc...`
  )
];

export type GetInitialMessageServiceResult = ServiceResponse<Message[]>;

export async function getInitialMessages({
  db,
  userId,
  ownerType,
  ownerIdentifier
}: GetInitialMessagesParams): Promise<GetInitialMessageServiceResult> {
  try {
    // Handle person-specific messages
    if (ownerType === CONVERSATION_OWNER_TYPES.PERSON && ownerIdentifier) {
      const { data: person, error: personError } = await db
        .from('person')
        .select('first_name')
        .eq('id', ownerIdentifier)
        .eq('user_id', userId)
        .single();

      if (personError) {
        errorLogger.log(ERRORS.FETCH_FAILED, { details: personError });
        return { data: null, error: ERRORS.FETCH_FAILED };
      }

      return { data: createPersonMessages(person.first_name), error: null };
    }

    // Handle group-specific messages (for backward compatibility)
    if (ownerType === CONVERSATION_OWNER_TYPES.GROUP && ownerIdentifier) {
      const { data: group, error: groupError } = await db
        .from('group')
        .select('slug, name, icon')
        .eq('id', ownerIdentifier)
        .eq('user_id', userId)
        .single();

      if (groupError) {
        errorLogger.log(ERRORS.FETCH_FAILED, { details: groupError });
        return { data: null, error: ERRORS.FETCH_FAILED };
      }

      // Check for reserved group slugs
      switch (group.slug) {
        case RESERVED_GROUP_SLUGS.INNER_5:
          return { data: INITIAL_MESSAGES.inner5, error: null };
        case RESERVED_GROUP_SLUGS.CENTRAL_50:
          return { data: INITIAL_MESSAGES.central50, error: null };
        case RESERVED_GROUP_SLUGS.STRATEGIC_100:
          return { data: INITIAL_MESSAGES.central100, error: null };
        default:
          return { data: createGroupMessages(group.name, group.icon), error: null };
      }
    }

    if (ownerType === CONVERSATION_OWNER_TYPES.ROUTE) {
      // Handle other paths
      if (APP_SEGMENTS.ROOT === ownerIdentifier) {
        return { data: INITIAL_MESSAGES.home, error: null };
      }
      if (APP_SEGMENTS.PEOPLE === ownerIdentifier) {
        return { data: INITIAL_MESSAGES.people, error: null };
      }
      if (APP_SEGMENTS.NETWORK === ownerIdentifier) {
        return { data: INITIAL_MESSAGES.network, error: null };
      }
      if (APP_SEGMENTS.BOOKMARKS === ownerIdentifier) {
        return { data: INITIAL_MESSAGES.bookmarks, error: null };
      }
      if (APP_SEGMENTS.ONBOARDING === ownerIdentifier) {
        return { data: INITIAL_MESSAGES.onboarding, error: null };
      }
    }

    // Default fallback
    return { data: INITIAL_MESSAGES.default, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}
