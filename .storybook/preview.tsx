import React from 'react';

import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '../src/app/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Turn off retries for Storybook to avoid unnecessary network requests
      retry: false,
      // Disable refetching on window focus for Storybook
      refetchOnWindowFocus: false,
      // Disable automatic refetching
      staleTime: Infinity
    }
  }
});

// Create a decorator that wraps all stories with the QueryClientProvider
const withReactQuery = (Story: React.ComponentType) => (
  <QueryClientProvider client={queryClient}>
    <Story />
  </QueryClientProvider>
);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  // Add the decorator to all stories
  decorators: [withReactQuery]
};

export default preview;
