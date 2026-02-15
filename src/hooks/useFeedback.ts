import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToken } from "../stores";
import {
  submitFeedback,
  getMyFeedbacks,
  type FeedbackItem,
  type FeedbackCreateData,
} from "../services/api";

// Query keys
export const feedbackKeys = {
  all: ["feedbacks"] as const,
  my: () => [...feedbackKeys.all, "my"] as const,
};

// Get user's feedbacks
export const useMyFeedbacks = () => {
  const token = useToken();

  return useQuery({
    queryKey: feedbackKeys.my(),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getMyFeedbacks(token);
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Submit feedback mutation with optimistic update
export const useSubmitFeedback = () => {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FeedbackCreateData) => {
      if (!token) throw new Error("Token mavjud emas");
      return submitFeedback(token, data);
    },
    // Optimistic update
    onMutate: async (newFeedback) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: feedbackKeys.my() });

      // Snapshot the previous value
      const previousFeedbacks = queryClient.getQueryData(feedbackKeys.my());

      // Optimistically add the new feedback
      queryClient.setQueryData(feedbackKeys.my(), (old: FeedbackItem[] | undefined) => {
        const tempFeedback: FeedbackItem = {
          id: `temp-${Date.now()}`,
          user_id: "current-user", // Will be replaced by server
          subject: newFeedback.subject,
          message: newFeedback.message,
          rating: newFeedback.rating || null,
          category: newFeedback.category || "general",
          admin_response: null,
          responded_at: null,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return old ? [tempFeedback, ...old] : [tempFeedback];
      });

      // Return context with the previous value
      return { previousFeedbacks };
    },
    // If mutation fails, roll back
    onError: (_err, _newFeedback, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(feedbackKeys.my(), context.previousFeedbacks);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
  });
};
