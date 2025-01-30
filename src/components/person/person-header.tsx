import { useRouter } from 'next/navigation';

import { Globe, Mail, Phone } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Database } from '@/types/database';

type Person = Database['public']['Tables']['person']['Row'];
type ContactMethod = Database['public']['Tables']['contact_methods']['Row'];

interface PersonHeaderProps {
  person: Person;
  contactMethods?: ContactMethod[];
  segment: string | null;
}

export function PersonHeader({ person, contactMethods = [], segment }: PersonHeaderProps) {
  const router = useRouter();
  const initials = `${person.first_name[0]}${person.last_name?.[0] || ''}`;

  return (
    <div className='px-5'>
      <div className='mt-4 flex items-center gap-3'>
        <Avatar className='h-8 w-8'>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <h1 className='text-lg font-medium'>
          {person.first_name} {person.last_name}
        </h1>
        <div className='flex gap-2'>
          <Badge variant='secondary'>Label 1</Badge>
          <Badge variant='secondary'>Label 2</Badge>
        </div>
        <div className='ml-auto flex gap-2'>
          {contactMethods.map((method) => (
            <Button key={method.id} variant='ghost' size='sm' className='h-8 w-8 p-0'>
              {method.type === 'email' && <Mail className='h-4 w-4' />}
              {method.type === 'phone' && <Phone className='h-4 w-4' />}
              {method.type === 'website' && <Globe className='h-4 w-4' />}
            </Button>
          ))}
        </div>
      </div>

      <div className='-mx-5'>
        <Tabs value={segment || 'summary'} className='mt-6'>
          <TabsList variant='underline' className='w-full justify-start gap-2 px-5'>
            <TabsTrigger value='summary' variant='underline' onClick={() => router.push(`/app/person/${person.id}`)}>
              Summary
            </TabsTrigger>
            <TabsTrigger
              value='activity'
              variant='underline'
              onClick={() => router.push(`/app/person/${person.id}/activity`)}>
              Activity
            </TabsTrigger>
            <TabsTrigger
              value='discovered'
              variant='underline'
              onClick={() => router.push(`/app/person/${person.id}/discovered`)}>
              Discovered
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
