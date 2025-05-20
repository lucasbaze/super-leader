'use client';

import { useRouter } from 'next/navigation';

import { OrganizationsTable } from '@/components/tables/organizations-table';
import { OrganizationsTableSkeleton } from '@/components/tables/organizations-table-skeleton';
import { useOrganizations } from '@/hooks/use-organizations';
import { routes } from '@/lib/routes';

export default function OrganizationsPage() {
  const router = useRouter();
  const { data: organizations = [], isLoading, error } = useOrganizations();

  const handleRowClick = (organizationId: number) => {
    router.push(routes.organization.byId({ id: organizationId }));
  };

  if (error) return <div>Error loading organizations</div>;

  return (
    <div className='absolute inset-0'>
      <div className='flex h-12 items-center border-b px-4'>
        <h1 className='text-lg font-semibold'>Organizations</h1>
        <span className='ml-2 text-sm text-muted-foreground'>{isLoading ? 0 : organizations.length} organizations</span>
      </div>
      <div className='absolute inset-0 top-[48px] mt-[1px]'>
        {isLoading ? (
          <OrganizationsTableSkeleton />
        ) : (
          <OrganizationsTable organizations={organizations} onRowClick={handleRowClick} />
        )}
      </div>
    </div>
  );
}
