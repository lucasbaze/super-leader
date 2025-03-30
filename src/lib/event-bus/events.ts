import { dateHandler } from '../dates/helpers';
import { BuildEvent, EmitData } from './types';

const getTimestamp = () => dateHandler().toISOString();

export type InteractionCreatedEvent = BuildEvent<
  'Interaction.Created',
  { personId: string; timestamp: string }
>;
type CreateInteractionCreatedEvent = Pick<InteractionCreatedEvent['payload'], 'personId'>;
export const createInteractionCreatedEvent = ({
  personId
}: CreateInteractionCreatedEvent): EmitData<InteractionCreatedEvent> => ({
  eventName: 'Interaction.Created',
  payload: { personId, timestamp: getTimestamp() },
  options: {}
});

export type PersonSummaryUpdatedEvent = BuildEvent<
  'Person.Summary.Updated',
  { personId: string; timestamp: string }
>;
type CreatePersonSummaryUpdatedEvent = Pick<PersonSummaryUpdatedEvent['payload'], 'personId'>;
export const createPersonSummaryUpdatedEvent = ({
  personId
}: CreatePersonSummaryUpdatedEvent): EmitData<PersonSummaryUpdatedEvent> => ({
  eventName: 'Person.Summary.Updated',
  payload: { personId, timestamp: getTimestamp() },
  options: {}
});
