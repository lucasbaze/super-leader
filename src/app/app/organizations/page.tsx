'use client';

import { useRouter } from 'next/navigation';

import { OrganizationsHeader } from '@/components/organizations/organizations-header';
import { OrganizationsTable } from '@/components/tables/organizations-table';
import { OrganizationsTableSkeleton } from '@/components/tables/organizations-table-skeleton';
import { useOrganizations } from '@/hooks/use-organizations';
import { routes } from '@/lib/routes';

export default function OrganizationsPage() {
  const router = useRouter();
  const { data: organizations = [], isLoading, error } = useOrganizations();

  const handleRowClick = (organizationId: string) => {
    router.push(routes.organization.byId({ id: organizationId }));
  };

  if (error) return <div>Error loading organizations</div>;

  return (
    <div className='absolute inset-0'>
      <OrganizationsHeader organizationsCount={isLoading ? 0 : organizations.length} />
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
