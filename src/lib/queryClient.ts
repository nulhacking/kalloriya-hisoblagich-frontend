import { QueryClient } from "@tanstack/react-query";

// Create a query client with optimized defaults for performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes (longer = less refetching)
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests only 1 time (faster failure)
      retry: 1,
      // Retry delay - start with 1 second
      retryDelay: 1000,
      // Refetch on window focus disabled (reduces unnecessary requests)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect
      refetchOnReconnect: false,
      // Network mode - always try first (for faster perceived load)
      networkMode: "offlineFirst",
    },
    mutations: {
      // No retry for mutations (faster feedback)
      retry: 0,
    },
  },
});
