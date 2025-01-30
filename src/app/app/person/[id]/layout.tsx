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
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerson } from '@/hooks/use-people';
import { usePersonAbout } from '@/hooks/use-person-about';

import { Globe, Mail, Phone } from 'lucide-react';
import { Users } from 'lucide-react';

export default function PersonLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const segment = useSelectedLayoutSegment() || 'summary';
  const { data: person, isLoading } = usePerson(params.id as string);
  const { data: aboutData } = usePersonAbout(params.id as string);

  if (isLoading) return <div>Loading...</div>;

  const initials = person ? `${person.first_name[0]}${person.last_name?.[0] || ''}` : '??';

  return (
    <div className='flex flex-col'>
      <div className='border-b'>
        <div className='mx-auto max-w-6xl px-5 py-3'>
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
        </div>
      </div>
      <div>
        <div className='mx-auto max-w-6xl px-5'>
          <div className='mt-4 flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <h1 className='text-lg font-medium'>
              {person?.first_name} {person?.last_name}
            </h1>
            <div className='flex gap-2'>
              <Badge variant='secondary'>Label 1</Badge>
              <Badge variant='secondary'>Label 2</Badge>
            </div>
            <div className='ml-auto flex gap-2'>
              {aboutData?.contactMethods.map((method) => (
                <Button key={method.id} variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  {method.type === 'email' && <Mail className='h-4 w-4' />}
                  {method.type === 'phone' && <Phone className='h-4 w-4' />}
                  {method.type === 'website' && <Globe className='h-4 w-4' />}
                </Button>
              ))}
            </div>
          </div>

          <div className='-mx-5'>
            <Tabs value={segment} className='mt-6'>
              <TabsList variant='underline' className='w-full justify-start gap-2 px-5'>
                <TabsTrigger
                  value='summary'
                  variant='underline'
                  onClick={() => router.push(`/app/person/${params.id}`)}>
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value='activity'
                  variant='underline'
                  onClick={() => router.push(`/app/person/${params.id}/activity`)}>
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value='about'
                  variant='underline'
                  onClick={() => router.push(`/app/person/${params.id}/about`)}>
                  About
                  {/* <span className='ml-2 rounded-full bg-muted px-2 text-xs'>39</span> */}
                </TabsTrigger>
                <TabsTrigger
                  value='discovered'
                  variant='underline'
                  onClick={() => router.push(`/app/person/${params.id}/discovered`)}>
                  Discovered
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className='mx-auto w-full max-w-6xl px-5 py-4'>{children}</div>
    </div>
  );
}
