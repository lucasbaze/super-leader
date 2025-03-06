'use client';

import { useUserContext } from '@/hooks/use-user-context';

import { ContextRawList } from './context-raw-list';

export function ContextRawListContainer() {
  const { data, isLoading, error } = useUserContext();

  console.log('data', data);

  return <ContextRawList contexts={data?.contexts} isLoading={isLoading} error={error} />;
}
