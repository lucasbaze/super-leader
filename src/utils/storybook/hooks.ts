import * as React from 'react';

// Mock implementations of your hooks
export const mockUsePerson = jest.fn();
export const mockUseMessages = jest.fn();
export const mockUseCreatePerson = jest.fn();
export const mockUseCreateInteraction = jest.fn();
export const mockUseCreateMessage = jest.fn();

// Mock the modules
jest.mock('@/hooks/use-person', () => ({
  usePerson: (id: string) => mockUsePerson(id)
}));

jest.mock('@/hooks/use-messages', () => ({
  useMessages: (params: any) => mockUseMessages(params)
}));

jest.mock('@/hooks/use-people', () => ({
  useCreatePerson: () => mockUseCreatePerson()
}));

jest.mock('@/hooks/use-person-activity', () => ({
  useCreateInteraction: (id: string) => mockUseCreateInteraction(id)
}));

jest.mock('@/hooks/use-messages', () => ({
  useCreateMessage: () => mockUseCreateMessage()
}));
