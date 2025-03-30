import { useEffect } from 'react';

import { clientEventBus } from './client-event-bus';

type EventCallback<T = any> = (payload: T) => void;
type AllEventsCallback<T = any> = (event: { eventName: string; payload: T }) => void;

/**
 * Hook to subscribe to events from the client event bus
 * @param eventName - The name of the event to subscribe to
 * @param callback - The callback function to execute when the event is emitted
 * @param dependencies - Optional array of dependencies for the useEffect hook
 */
export function useSubscribeToEventBus<T = any>(
  eventName: string,
  callback: EventCallback<T>,
  dependencies: any[] = []
) {
  useEffect(() => {
    clientEventBus.on(eventName, callback);

    return () => {
      clientEventBus.off(eventName, callback);
    };
  }, [eventName, callback, ...dependencies]);
}

/**
 * Hook to subscribe to all events from the client event bus
 * @param callback - The callback function to execute when any event is emitted
 * @param dependencies - Optional array of dependencies for the useEffect hook
 */
export function useSubscribeToAllEvents<T = any>(
  callback: AllEventsCallback<T>,
  dependencies: any[] = []
) {
  useEffect(() => {
    clientEventBus.on('*', callback);

    return () => {
      clientEventBus.off('*', callback);
    };
  }, [callback, ...dependencies]);
}
