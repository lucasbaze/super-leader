'use client';

import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerson } from '@/hooks/use-people';

export default function PersonLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const segment = useSelectedLayoutSegment() || 'activity';
  const { data: person, isLoading } = usePerson(params.id as string);

  if (isLoading) return <div>Loading...</div>;

  const initials = person ? `${person.first_name[0]}${person.last_name?.[0] || ''}` : '??';

  return (
    <div className='flex flex-col gap-6'>
      <div className='border-b pb-4'>
        <Breadcrumb className='mb-4'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='/app/people'>People</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {person?.first_name} {person?.last_name}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className='flex items-center gap-4'>
          <Avatar className='h-16 w-16'>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-2xl font-bold'>
              {person?.first_name} {person?.last_name}
            </h1>
            <div className='mt-1 flex gap-2'>{/* Add tags here when implemented */}</div>
          </div>
        </div>

        <Tabs value={segment} className='mt-6'>
          <TabsList>
            <TabsTrigger value='activity' onClick={() => router.push(`/app/people/${params.id}`)}>
              Activity
            </TabsTrigger>
            <TabsTrigger value='emails' onClick={() => router.push(`/app/people/${params.id}/emails`)}>
              Emails
            </TabsTrigger>
            <TabsTrigger value='files' onClick={() => router.push(`/app/people/${params.id}/files`)}>
              Files
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {children}
    </div>
  );
}
