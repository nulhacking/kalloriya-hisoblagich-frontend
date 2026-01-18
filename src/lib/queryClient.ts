import { QueryClient } from "@tanstack/react-query";

// Create a query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 2 minutes (reduced for fresher data)
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Refetch on window focus (good for keeping data fresh)
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default (can be overridden)
      refetchOnReconnect: false,
      // Don't use placeholder data - show loading state instead
      placeholderData: undefined,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});
