import { stripIndents } from 'common-tags';

import { dateHandler } from '@/lib/dates/helpers';
import { createError, errorLogger } from '@/lib/errors';
import { TASK_TRIGGERS } from '@/lib/tasks/constants';
import { getTasks } from '@/services/tasks/get-tasks';
import { DBClient, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai/generate-object';

import { getPeopleForFollowup, GetPeopleForFollowupResult } from './adapters/get-people-for-followup';
import { buildContextForPerson } from './build-context-for-person';
import { GenerateActionPlanSchema } from './schema';

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

// Define errors
export const ERRORS = {
  GENERATION: {
    FETCHING_BIRTHDAYS_FAILED: createError(
      'fetching_birthdays_failed',
      ErrorType.API_ERROR,
      'Failed to fetch birthdays',
      'Unable to fetch birthdays at this time'
    ),
    BIRTHDAY_TASKS_FAILED: createError(
      'birthday_tasks_failed',
      ErrorType.API_ERROR,
      'Failed to generate birthday tasks',
      'Unable to generate birthday tasks at this time'
    ),
    FETCHING_PEOPLE_FAILED: createError(
      'fetching_people_failed',
      ErrorType.API_ERROR,
      'Failed to fetch people',
      'Unable to fetch people at this time'
    )
  }
};

type PersonWithBirthday = Person & { birthday: string };
type PersonWithBirthdayFragment = {
  personId: string;
  personName: string;
  birthdayDate: string;
};

const getPeopleWithUpcomingBirthdays = async (
  db: DBClient,
  userId: string
): Promise<ServiceResponse<PersonWithBirthdayFragment[]>> => {
  try {
    // Get people with birthdays in next 30 days
    const thirtyDaysFromNow = dateHandler().add(30, 'days').format('MM-DD');
    const today = dateHandler().format('MM-DD');

    const { data: peopleWithBirthdays, error: fetchBirthdayError } = await db.rpc(
      'get_people_with_upcoming_birthdays',
      {
        p_user_id: userId,
        p_start_date: today,
        p_end_date: thirtyDaysFromNow
      }
    );

    if (fetchBirthdayError) {
      return {
        data: null,
        error: { ...ERRORS.GENERATION.FETCHING_BIRTHDAYS_FAILED, details: fetchBirthdayError }
      };
    }

    // Create an array of promises for task creation
    const birthdaysWithoutTasks: PersonWithBirthdayFragment[] = peopleWithBirthdays.map(
      async (person: PersonWithBirthday) => {
        // Check if there's already an active birthday task
        // TODO: Only check within the next 30 days
        const existingTasksResult = await getTasks({
          db,
          userId,
          personId: person.id
        });

        const hasExistingBirthdayTask = existingTasksResult.data?.some(
          (task) => task.trigger === TASK_TRIGGERS.BIRTHDAY_REMINDER.slug
        );

        if (hasExistingBirthdayTask) {
          return null;
        }

        // Generate task content
        const birthdayDate = dateHandler(person.birthday).format('MMMM D');

        return {
          personId: person.id,
          personName: person.first_name,
          birthdayDate
        };
      }
    );

    // Wait for all task creation promises to complete
    const results = (await Promise.all(birthdaysWithoutTasks)).filter((result) => result !== null);

    return { data: results, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.GENERATION.BIRTHDAY_TASKS_FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
};

const BIRTHDAY_ADAPTER_ERRORS = {
  FAILED_TO_BUILD_BIRTHDAY_CONTEXT: createError(
    'failed_to_build_birthday_context',
    ErrorType.API_ERROR,
    'Failed to build birthday context',
    'Unable to build birthday context at this time'
  )
};

const birthdayAdapter: InputAdapter<PersonWithBirthdayFragment[]> = {
  id: 'upcoming-birthdays',
  description: 'Upcoming birthdays the user has recorded for their contacts',
  tags: ['birthday', 'upcoming', 'gifts'],
  async getContextFragments({ db, userId }) {
    try {
      const { data, error } = await getPeopleWithUpcomingBirthdays(db, userId);

      if (error) {
        return { peopleIds: [], data: null };
      }

      const peopleIds = data?.map((person) => person.personId) ?? [];

      return { peopleIds, data };
    } catch (error) {
      errorLogger.log(BIRTHDAY_ADAPTER_ERRORS.FAILED_TO_BUILD_BIRTHDAY_CONTEXT, { details: error });
      return { peopleIds: [], data: null };
    }
  }
};

const needsFollowUpAdapter: InputAdapter<GetPeopleForFollowupResult> = {
  id: 'needs-follow-up',
  description: 'People that generally could use a follow up',
  tags: ['follow-up', 'general', 'content-suggestion', 'last-touch'],
  async getContextFragments({ db, userId }) {
    const { data, error: getPeopleError } = await getPeopleForFollowup({ db, userId });

    if (getPeopleError) {
      return { peopleIds: [], data: null };
    }

    return { peopleIds: data?.personIds ?? [], data };
  }
};

const inputAdaptersRegistry = [birthdayAdapter, needsFollowUpAdapter];

interface ContextBuilderParams {
  inputAdapters: InputAdapter<any>[];
  db: DBClient;
  userId: string;
}

const buildInputContext = async ({ inputAdapters, db, userId }: ContextBuilderParams) => {
  // Get the user's basic information

  // Get the input context from the input adapters

  const peopleToFetchContextFor: string[] = [];
  const inputContextPromises = inputAdapters.map(async (adapter) => {
    const { data, peopleIds } = await adapter.getContextFragments({ db, userId });

    if (!data) {
      return null;
    }

    // Aggregate all the people ids to fetch context for
    peopleToFetchContextFor.push(...peopleIds.flat());

    return `
      Input: ${adapter.id}
      Description: ${adapter.description}
      Tags: ${adapter.tags.join(', ')}
      Context Fragments: ${JSON.stringify(data, null, 2)}
    `;
  });

  const inputContext = (await Promise.all(inputContextPromises)).filter((context) => context !== null).join('\n');

  // TODO: Get the profile and notes about the people that have been selected to possibly follow up with.
  const peopleProfilesPromises = peopleToFetchContextFor.map(async (personId) => {
    const { data: person, error: personError } = await buildContextForPerson({ db, personId, userId });

    if (personError) {
      return null;
    }

    return person;
  });

  const peopleProfiles = (await Promise.all(peopleProfilesPromises)).filter((profile) => profile !== null);

  return {
    inputContext,
    peopleProfiles
  };
};

export const SUGGESTED_ACTION_TYPE_SLUGS = {
  SEND_MESSAGE: 'send-message',
  SHARE_CONTENT: 'share-content',
  ADD_NOTE: 'add-note',
  BUY_GIFT: 'buy-gift'
} as const;

type ActionAdapter = {
  slug: string;
  description: string;
  whenToUse: string;
  expectedContextToGenerateOutput: string;
  tags: string[];
};

const sendMessageActionAdapter: ActionAdapter = {
  slug: SUGGESTED_ACTION_TYPE_SLUGS.SEND_MESSAGE,
  description:
    'Suggest to send a simple text based message to the person such as text or an email. This is be a short message that is not too long or too short.',
  whenToUse:
    'When the relationship or context suggests that a simple touch point is appropriate. Such as asking how they are doing, asking about how a previous trip went, etc...',
  expectedContextToGenerateOutput:
    'Provide the personId of the person to send the message to and the context of why the user should send the message. Do not generate the message, simply the relevant context and why the user should send the message.',
  tags: ['send-message', 'text', 'email', 'simple', 'basic', 'short']
};

const sendContentActionAdapter: ActionAdapter = {
  slug: SUGGESTED_ACTION_TYPE_SLUGS.SHARE_CONTENT,
  description: 'Suggest the user to share content with the person such as an article, video, or other content.',
  whenToUse:
    'This is a great option for a generic follow up that does not have a clear trigger or reason to follow up. Alternatively, if there is relevant news that included in the inputs that could be shared with the person based on their interests or goals, we can share that.',
  expectedContextToGenerateOutput:
    "Provide the personId of the person to share the content with and the context of why the user should share the content. Do not generate the content unless it was already provided in the inputs. Simply include the relevant context, the type of content that could be shared based on the person's interests or goals, and why the user should share the content.",
  tags: ['share-content', 'article', 'video', 'content', 'short']
};

const addNoteActionAdapter: ActionAdapter = {
  slug: SUGGESTED_ACTION_TYPE_SLUGS.ADD_NOTE,
  description:
    "Suggest the user to add a note to the person's profile to improve context, recall, and the profile completeness of the relationship.",
  whenToUse:
    'This should be used when the person\'s profile completeness can be improved. Anyone in the 5, 50, or 100 groups should have at least 80 - 90% profile completeness. This is also great to use as a possible "pre-follow up" to get more information about the person. For instance if the user snoozes a follow up, or does not need to follow up today, we can use the "add note" as a mental trigger for the user to follow up with the person or ask a meaningful question.',
  expectedContextToGenerateOutput:
    'Provide the personId of the person to add the note to, the specific question or information the user should note down, and why it is important to note down. Do not assume you know the answer or what to note down, simply ask the user to note down the information. You can provide example answers if you think it will help the user.',
  tags: ['context', 'crm-maintenance', 'data-hygeine', 'relatoinshiorelation']
};

const buyGiftActionAdapter: ActionAdapter = {
  slug: SUGGESTED_ACTION_TYPE_SLUGS.BUY_GIFT,
  description: 'Suggest the user to buy a gift for the person.',
  whenToUse: 'This should be used when the person has a birthday or anniversary coming up.',
  expectedContextToGenerateOutput:
    'Simply provide the personId of the person to buy the gift for. Do not generate the gift, simply the relevant context and why the user should buy the gift. If the person is in the 5, 50, or 100 groups, it is more important to try to buy a gift if the nature of the relationship is more intimate or personal. If the person is in the other groups, it is less important to buy a gift.',
  tags: ['birthday', 'anniversary', 'relationship-building', 'relationship-deepening']
};

const outputActionAdaptersRegistry = [
  sendMessageActionAdapter,
  sendContentActionAdapter,
  addNoteActionAdapter,
  buyGiftActionAdapter
];

export const buildOutputActionContext = (actionAdapters: ActionAdapter[]) => {
  const actionOptionsContext = actionAdapters.map((adapter) => {
    return `
      Action Name: ${adapter.slug}
      Description: ${adapter.description}
      When To Use: ${adapter.whenToUse}
      Expected Context To Generate Output: ${adapter.expectedContextToGenerateOutput}
      Tags: ${adapter.tags.join(', ')}
    `;
  });
  return actionOptionsContext;
};

interface GenerateActionPlanParams {
  db: DBClient;
  userId: string;
}

export const generateActionPlan = async ({ db, userId }: GenerateActionPlanParams) => {
  // TODO: Format to the user's timezone
  const today = dateHandler().format('dddd, MM-DD-YYYY');
  const context = await buildInputContext({ inputAdapters: inputAdaptersRegistry, db, userId });
  const outputOptions = buildOutputActionContext(outputActionAdaptersRegistry);

  const prompt = stripIndents`
    💡 **PURPOSE**
Every 24 hours generate a prioritized action plan that keeps <PRINCIPAL_NAME>’s personal & professional
network compounding toward their stated goals. Analyze the data provided to you via the inputs and generate an actionable plan for the day based on the available outputs options.

Today is ${today}.

-------------------------------------------------------------------------------------------------
SECTION 1 – HIGH-LEVEL GUIDING PRINCIPLES
-------------------------------------------------------------------------------------------------
You are “ENCORE-AI”, an autonomous relationship-ops strategist
Operate by these axioms (do NOT violate them):

Relationships as Assets – Treat every contact like a long-duration compounding investment: protect principal (trust), reinvest dividends (value-adds)

Human-Centric Design – Interactions should leave the other person feeling heard, helped, and slightly better off than before.

Double-Win Bias – Propose actions (intro, ask, event) that plausibly benefits every party involved, even if only small such as saying hello.

Evidence > Assumption – ground Recommendations in information provided; flag missing info explicitly.

Compounding → Action – a task not surfaced in time is opportunity lost; bias toward concrete next steps.

Know Like, and Trust - Build for the long-term.


-------------------------------------------------------------------------------------------------
SECTION 2 – INGESTED INPUT BLOCKS 
-------------------------------------------------------------------------------------------------

The following are the input context fragments that you should use to generate the action plan.

${context.inputContext}

People Profiles:

${context.peopleProfiles}

-------------------------------------------------------------------------------------------------
SECTION 3 – PROCESS PIPELINE
-------------------------------------------------------------------------------------------------

High level process:
1. Review the information provided and create a mental model of the information.
2. Prioritize people to follow up with and actions to take.
3. Suggest the actions for the user to take based on the current context and user preferences.


General Guidelines:

1. Remember the guiding principles and axioms.
2. Prioritize any tasks that were already created and are due today or in the next 24 hours.
3. Evaluate any 5, 50,and 100 contacts for data completeness and pose any questions to the user to fill in the gaps.
4. Suggest follow ups for any contacts that have not been touched in relation to their general last touch.
5. It's important to follow up with folks that have been recently added to build trust and rapport momentum.
6. Ensure the user has ample time to buy gifts for any birthday or anniversary.
7. Suggest any introductions that would be beneficial for the participants goals or objectives not just the user's.
8. Ensure that the user has been sufficiently onboarded and is taking consistent action every day.
9. If the user is onboarding, it's important to suggest actions that will help them get to the next stage of onboarding. These should be prioritized over other actions.
10. Not every birthday is a gift opportunity, so it's important to prioritize the gift opportunities vs. simply saying Happy Birthday. Use the context about the relationship to determine if a gift is appropriate. You don't need to suggest the specific gift, simply if a gift is appropriate based on the relationship.


General follow up heuristics:
- People in the Inner 5 Group, should be followed up with at least weekly.
- People in the Central 50 Group, should be followed up with at least every 2 weeks, no more than 3 weeks.
- People in the Strategic 100 Group, should be followed up with at monthly.
- People in other groups or not grouped take the least priority, but should be follow up with quarterly if included in the action plan.

IMPORTANT:
There will definitely be more actions to choose from should be done in a day. You must prioritize the people and actions that could be taken in a day and select the most important ones. It's important to not overwhelm the user with too many actions especially depending on the user's preferences or stage of their onboarding.

-------------------------------------------------------------------------------------------------
SECTION 4 – TASK GENERATION OPTIONS
-------------------------------------------------------------------------------------------------

The following are the available outputs that you should select in order to generate the action plan. Remember to only output 1 action per person that is the most important one. If there are multiple actions that could be taken, choose the more actionable one. 

These are the available actions that you can select from to generate the action plan.
${outputOptions}

-------------------------------------------------------------------------------------------------
SECTION 5 – OUTPUT STYLE & FORMAT
-------------------------------------------------------------------------------------------------

Format: 

The output format should be a JSON object that includes a brief executive summary, the tasks the user should perform grouped by the type of action to take, and a quote for inspiration.

The executive summary should be at most 2 sentences summarizing the action plan and encouraging the user to take action. 
The grouped tasks should have a title, description, icon, and the tasks to perform and the person to perform them with.
The quote should be a quote for inspiration that is relevant to relationship building.


Style & Tone:
The tone should be professional, but friendly and engaging. Word choice should emphasize progress, development, and growth. It should be make the user feel like they're becoming a better person and leader.

Sentences should be short, concise, and to the point.

-------------------------------------------------------------------------------------------------
SECTION 6 – USER PREFERENCES
-------------------------------------------------------------------------------------------------

Before finalizing the action plan, review the following preferences and modify or filter the action plan accordingly.

These are the current user preferences:
    ${null}
  `;

  console.log('prompt', prompt);

  const actionPlan = await generateObject({
    schema: GenerateActionPlanSchema,
    model: 'o3',
    prompt
  });

  return actionPlan;
};

// const buildActionPlan = async (db: DBClient, userId: string) => {
//   const actionPlan = await generateActionPlan(db, userId);

//   return actionPlan;
// };
