'use client';

import { useRouter } from 'next/navigation';

import { format } from 'date-fns';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useGroupMembers } from '@/hooks/use-group-members';
import { Person } from '@/types/database';

export default function InnerFivePage() {
  const router = useRouter();
  const { data: people = [], isLoading, error } = useGroupMembers('inner-5');

  const handleRowClick = (personId: string) => {
    router.push(`/app/person/${personId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading Inner 5 members</div>;

  return (
    <div className='absolute inset-0'>
      {/* Fixed Headers */}
      <div className='absolute inset-x-0 top-0 z-20 bg-background'>
        <div className='border-b'>
          <div className='flex h-12 items-center justify-between px-4'>
            <h1 className='text-lg font-semibold'>Inner 5</h1>
          </div>
        </div>
        <div className='bg-background px-4'>
          <Table>
            <TableHeader>
              <TableRow className='text-left'>
                <TableHead>Name</TableHead>
                <TableHead>Birthday</TableHead>
                <TableHead>Date Met</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>AI Summary</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='absolute inset-0 top-[88px] overflow-y-auto'>
        <div className='px-4'>
          <Table>
            <TableBody>
              {people.map((person: Person) => (
                <TableRow
                  key={person.id}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => handleRowClick(person.id)}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Avatar className='size-6'>
                        <AvatarFallback className='text-xs'>
                          {person.first_name?.[0]}
                          {person.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {person.first_name} {person.last_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {person.birthday ? format(new Date(person.birthday), 'PP') : 'Not set'}
                  </TableCell>
                  <TableCell>
                    {person.date_met ? format(new Date(person.date_met), 'PP') : 'Not set'}
                  </TableCell>
                  <TableCell className='max-w-[200px] truncate'>{person.bio || 'No bio'}</TableCell>
                  <TableCell className='max-w-[200px] truncate'>
                    {person.ai_summary || 'No summary'}
                  </TableCell>
                </TableRow>
              ))}
              {people.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    No members found in Inner 5
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
