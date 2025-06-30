'use client';

import { ActionPlanContainer } from '@/components/action-plan/action-plan-container';
import { useActionPlan } from '@/hooks/use-action-plan';

export function ActionPlanTab() {
  const { data, isLoading, error } = useActionPlan();

  return <ActionPlanContainer actionPlan={data?.actionPlan} tasks={data?.tasks} isLoading={isLoading} error={error} />;
}
