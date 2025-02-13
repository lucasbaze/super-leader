'use client';

import { Button } from '@/components/ui/button';
import { useUpdateFollowUpScore } from '@/hooks/use-update-follow-up-score';

interface UpdateFollowUpScoreButtonProps {
  personId: string;
}

export function UpdateFollowUpScoreButton({ personId }: UpdateFollowUpScoreButtonProps) {
  const { mutate: updateScore, isPending } = useUpdateFollowUpScore();

  const handleClick = () => {
    updateScore({ personId });
  };

  return (
    <Button size='sm' onClick={handleClick} disabled={isPending}>
      {isPending ? 'Updating...' : 'Update Follow-up Score'}
    </Button>
  );
}
