import { QueryClient } from '@tanstack/react-query';

// Helper function to set mock data for a specific query
export function setQueryData(queryClient: QueryClient, queryKey: unknown[], data: unknown) {
  queryClient.setQueryData(queryKey, data);
}

// Create a mock query client with predefined data
export function createMockQueryClient(mockData: Record<string, unknown> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity
      }
    }
  });

  // Set mock data for each query key
  Object.entries(mockData).forEach(([key, value]) => {
    queryClient.setQueryData([key], value);
  });

  return queryClient;
}
