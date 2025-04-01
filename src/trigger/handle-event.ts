import { task } from '@trigger.dev/sdk/v3';

import { EventNames } from '@/lib/event-bus/event-names';
import {
  createPersonSummaryUpdatedEvent,
  InteractionCreatedEvent,
  PersonSummaryUpdatedEvent
} from '@/lib/event-bus/events';
import { BuildEvent, EmitData } from '@/lib/event-bus/types';
import { JOBS } from '@/lib/jobs/constants';
import { updateAISummary } from '@/services/summary/update-ai-summary';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

// Define the event task that will handle all events
export const handleEvent = task({
  id: JOBS.HANDLE_EVENT,
  run: async (event: EmitData<BuildEvent<EventNames, any>>) => {
    // This task will be the entry point for all events
    // It will then trigger the appropriate handler based on the event name
    switch (event.eventName) {
      case 'Interaction.Created':
        await handleInteractionCreated.trigger(event.payload);
        break;
      case 'Person.Summary.Updated':
        await handlePersonSummaryUpdated.trigger(event.payload);
        break;
      // Add other event handlers here
    }
  }
});

// Handler for Interaction.Created events
export const handleInteractionCreated = task({
  id: JOBS.HANDLE_INTERACTION_CREATED,
  run: async (payload: InteractionCreatedEvent['payload']) => {
    // Here we can trigger the AI summary update
    await updateAISummaryTask.trigger(
      {
        personId: payload.personId,
        userId: payload.userId,
        personName: payload.personName
      },
      {
        tags: [`user:${payload.userId}`]
      }
    );
  }
});

// Handler for Person.Summary.Updated events
export const handlePersonSummaryUpdated = task({
  id: JOBS.HANDLE_PERSON_SUMMARY_UPDATED,
  run: async (payload: PersonSummaryUpdatedEvent['payload']) => {
    // Handle the summary update event
    console.log('Person summary updated:', payload);
  }
});

// Task for updating AI summary
export const updateAISummaryTask = task({
  id: JOBS.UPDATE_AI_SUMMARY,
  run: async ({
    personId,
    userId,
    personName
  }: {
    personId: string;
    userId: string;
    personName: string;
  }) => {
    // Implement the AI summary update logic here
    // This would be the server-side version of what's currently in useUpdateAISummary
    console.log('Updating AI summary for person:', personId);

    const supabase = await createServiceRoleClient();

    const result = await updateAISummary({
      db: supabase,
      personId
    });

    if (result.error) {
      throw result.error;
    }

    // Emit the Person.Summary.Updated event
    await handleEvent.trigger(
      createPersonSummaryUpdatedEvent({
        personId,
        userId,
        personName
      })
    );
  }
});
