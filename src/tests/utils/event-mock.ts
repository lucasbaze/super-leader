import { jest } from '@jest/globals';

import { EmitData, EventTemplate } from '@/lib/event-bus/types';

// Create a mock for handleEvent.trigger
export const mockHandleEventTrigger = jest.fn();

// Helper to verify if handleEvent.trigger was called with specific event data
export const verifyEventTrigger = (expectedEvent: EmitData<EventTemplate>) => {
  expect(mockHandleEventTrigger).toHaveBeenCalledWith(expectedEvent);
};

// Helper to verify if handleEvent.trigger was called with specific event name
export const verifyEventTriggerName = (expectedEventName: string) => {
  expect(mockHandleEventTrigger).toHaveBeenCalledWith(
    expect.objectContaining({
      eventName: expectedEventName
    })
  );
};

// Helper to verify if handleEvent.trigger was called with specific payload
export const verifyEventTriggerPayload = (expectedPayload: Record<string, any>) => {
  expect(mockHandleEventTrigger).toHaveBeenCalledWith(
    expect.objectContaining({
      payload: expect.objectContaining(expectedPayload)
    })
  );
};

// Helper to clear all event trigger mocks
export const clearEventTriggerMocks = () => {
  mockHandleEventTrigger.mockClear();
};

// Helper to reset all event trigger mocks
export const resetEventTriggerMocks = () => {
  mockHandleEventTrigger.mockReset();
};
