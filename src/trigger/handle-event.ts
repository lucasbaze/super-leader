import { task } from '@trigger.dev/sdk/v3';

import { EventNames } from '@/lib/event-bus/event-names';
import { InteractionCreatedEvent, PersonSummaryUpdatedEvent } from '@/lib/event-bus/events';
import { BuildEvent, EmitData } from '@/lib/event-bus/types';

// Define the event task that will handle all events
export const handleEvent = task({
  id: 'handle-event',
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
  id: 'handle-interaction-created',
  run: async (payload: InteractionCreatedEvent['payload']) => {
    // Here we can trigger the AI summary update
    await updateAISummary.trigger({
      personId: payload.personId
    });
  }
});

// Handler for Person.Summary.Updated events
export const handlePersonSummaryUpdated = task({
  id: 'handle-person-summary-updated',
  run: async (payload: PersonSummaryUpdatedEvent['payload']) => {
    // Handle the summary update event
    console.log('Person summary updated:', payload);
  }
});

// Task for updating AI summary
export const updateAISummary = task({
  id: 'update-ai-summary',
  run: async ({ personId }: { personId: string }) => {
    // Implement the AI summary update logic here
    // This would be the server-side version of what's currently in useUpdateAISummary
    console.log('Updating AI summary for person:', personId);

    // Emit the Person.Summary.Updated event
    await handleEvent.trigger({
      eventName: 'Person.Summary.Updated',
      payload: {
        personId,
        timestamp: new Date().toISOString()
      },
      options: {}
    });
  }
});
