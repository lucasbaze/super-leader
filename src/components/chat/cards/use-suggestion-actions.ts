import { useCallback } from 'react';

import { useUpdateSuggestion } from '@/hooks/use-suggestions';

export function useSuggestionActions() {
  const updateSuggestion = useUpdateSuggestion();

  const handleSuggestionViewed = useCallback(
    (suggestionId: string) => {
      updateSuggestion.mutate({
        suggestionId,
        viewed: true
      });
    },
    [updateSuggestion]
  );

  const handleSuggestionBookmark = useCallback(
    (suggestionId: string, saved: boolean) => {
      updateSuggestion.mutate({
        suggestionId,
        saved
      });
    },
    [updateSuggestion]
  );

  const handleSuggestionDislike = useCallback(
    (suggestionId: string, bad: boolean) => {
      updateSuggestion.mutate({
        suggestionId,
        bad
      });
    },
    [updateSuggestion]
  );

  return {
    handleSuggestionViewed,
    handleSuggestionBookmark,
    handleSuggestionDislike,
    isUpdating: updateSuggestion.isPending
  };
}
