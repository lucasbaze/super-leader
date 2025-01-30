'use client';

import Link from 'next/link';
import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerson } from '@/hooks/use-people';

import { Users } from 'lucide-react';

export default function PersonLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const segment = useSelectedLayoutSegment() || 'activity';
  const { data: person, isLoading } = usePerson(params.id as string);

  if (isLoading) return <div>Loading...</div>;

  const initials = person ? `${person.first_name[0]}${person.last_name?.[0] || ''}` : '??';

  return (
    <div className='flex flex-col'>
      <div className='border-b'>
        <div className='px-6 py-4'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/app/people' className='flex items-center gap-2 text-muted-foreground'>
                    <Users className='h-4 w-4' />
                    <span>People</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {person?.first_name} {person?.last_name}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className='mt-4 flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <h1 className='text-xl font-semibold'>
              {person?.first_name} {person?.last_name}
            </h1>
            <div className='flex gap-2'>
              <Badge variant='secondary'>Label 1</Badge>
              <Badge variant='secondary'>Label 2</Badge>
            </div>
          </div>

          <Tabs value={segment} className='mt-6'>
            <TabsList variant='underline' className='w-full justify-start gap-2'>
              <TabsTrigger value='activity' variant='underline' onClick={() => router.push(`/app/person/${params.id}`)}>
                Activity
              </TabsTrigger>
              <TabsTrigger
                value='emails'
                variant='underline'
                onClick={() => router.push(`/app/person/${params.id}/emails`)}>
                Emails
                <span className='ml-2 rounded-full bg-muted px-2 text-xs'>39</span>
              </TabsTrigger>
              <TabsTrigger
                value='files'
                variant='underline'
                onClick={() => router.push(`/app/person/${params.id}/files`)}>
                Files
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className='px-6 py-4'>{children}</div>
    </div>
  );
}
