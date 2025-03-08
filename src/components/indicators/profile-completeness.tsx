'use client';

import { CircleProgress } from '@/components/ui/circle-progress';
import { PieProgress } from '@/components/ui/pie-progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ProfileCompletenessProps = {
  score: number;
  size?: number;
  showTooltip?: boolean;
  className?: string;
};

export function ProfileCompleteness({
  score,
  size = 40,
  showTooltip = true,
  className
}: ProfileCompletenessProps) {
  const completenessScore = Math.max(0, Math.min(100, Math.round(score || 0)));

  const indicator = (
    <div className={`hover:cursor-pointer ${className}`}>
      {/* <CircleProgress value={completenessScore} size={size} /> */}
      <PieProgress value={completenessScore} size={size} />
    </div>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{indicator}</TooltipTrigger>
        <TooltipContent>
          <p>Profile Completeness: {completenessScore}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
