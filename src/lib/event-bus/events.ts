import { dateHandler } from '../dates/helpers';
import { BuildEvent, EmitData } from './types';

const getTimestamp = () => dateHandler().toISOString();

export type InteractionCreatedEvent = BuildEvent<
  'Interaction.Created',
  { personId: string; timestamp: string }
>;
type CreateInteractionCreatedEvent = Pick<InteractionCreatedEvent['data'], 'personId'>;
export const createInteractionCreatedEvent = ({
  personId
}: CreateInteractionCreatedEvent): EmitData<InteractionCreatedEvent> => ({
  eventName: 'Interaction.Created',
  data: { personId, timestamp: getTimestamp() },
  options: {}
});
