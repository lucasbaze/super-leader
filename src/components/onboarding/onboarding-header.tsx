'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingHeaderProps {
  // step: number;
  // totalSteps: number;
  isLoading?: boolean;
  canComplete?: boolean;
  onComplete?: () => void;
}

export function OnboardingHeader({
  // step,
  // totalSteps,
  isLoading = false,
  canComplete = false,
  onComplete
}: OnboardingHeaderProps) {
  // const progress = Math.round((step / totalSteps) * 100);

  return (
    <header className='fixed inset-x-0 top-0 z-50 border-b bg-background px-4 py-3 sm:px-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='text-lg font-medium'>Welcome to Super Leader</div>
        </div>

        <div className='flex items-center gap-4'>
          {canComplete && (
            <Button onClick={onComplete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Completing...
                </>
              ) : (
                <>Complete Onboarding</>
              )}
            </Button>
          )}

          {/* <div className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </div> */}
        </div>
      </div>

      {/* Progress bar */}
      {/* <div className="h-1 w-full mt-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full bg-primary transition-all duration-300 ease-in-out",
            isLoading && "animate-pulse"
          )}
          style={{ width: `${progress}%` }}
        />
      </div> */}
    </header>
  );
}
