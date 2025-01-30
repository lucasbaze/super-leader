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

import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { Users } from 'lucide-react';

function PersonBioSidebar({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className='space-y-8'>
      {/* Bio Section */}
      {data.person.bio && (
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-muted-foreground'>Bio</h3>
          <p className='text-sm'>{data.person.bio}</p>
        </section>
      )}

      {/* Contact Methods */}
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Contact Information</h3>
        <div className='space-y-3'>
          {data.contactMethods.map((method: any) => (
            <div key={method.id} className='flex items-start space-x-2'>
              {method.type === 'email' && <Mail className='mt-1 h-3.5 w-3.5 text-muted-foreground' />}
              {method.type === 'phone' && <Phone className='mt-1 h-3.5 w-3.5 text-muted-foreground' />}
              <div className='flex-1'>
                <p className='text-sm'>{method.value}</p>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>{method.label}</span>
                  {method.is_primary && (
                    <Badge variant='secondary' className='h-4 px-1 py-0 text-[10px]'>
                      Primary
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Addresses */}
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Addresses</h3>
        <div className='space-y-3'>
          {data.addresses.map((address: any) => (
            <div key={address.id} className='flex items-start space-x-2'>
              <MapPin className='mt-1 h-3.5 w-3.5 text-muted-foreground' />
              <div>
                <p className='text-sm'>{address.street}</p>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {address.city}, {address.state} {address.country}
                  </span>
                  {address.is_primary && (
                    <Badge variant='secondary' className='h-4 px-1 py-0 text-[10px]'>
                      Primary
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Websites */}
      {data.websites.length > 0 && (
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-muted-foreground'>Websites & Social</h3>
          <div className='space-y-2'>
            {data.websites.map((website: any) => (
              <div key={website.id} className='flex items-center space-x-2'>
                <Globe className='h-3.5 w-3.5 text-muted-foreground' />
                <a
                  href={website.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-primary hover:underline'>
                  {website.label || website.url}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Record Details */}
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Record Details</h3>
        <div className='space-y-1 text-xs text-muted-foreground'>
          <p>Last Updated: {new Date(data.person.updated_at).toLocaleDateString()}</p>
          <p>Created: {new Date(data.person.created_at).toLocaleDateString()}</p>
        </div>
      </section>
    </div>
  );
}

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
      {/* Header */}
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

      {/* Main Content with Sidebar */}
      <div className='mx-auto w-full max-w-6xl px-5'>
        <div className='grid grid-cols-3 gap-8'>
          {/* Main Content Column */}
          <div className='col-span-2'>
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
                    value='discovered'
                    variant='underline'
                    onClick={() => router.push(`/app/person/${params.id}/discovered`)}>
                    Discovered
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className='py-4'>{children}</div>
          </div>

          {/* Sidebar Column */}
          <div className='border-l pl-4 pt-4'>
            <PersonBioSidebar data={aboutData} />
          </div>
        </div>
      </div>
    </div>
  );
}
