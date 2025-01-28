'use client';

import { useEffect, useState } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Person } from '@/types/people';

import { format } from 'date-fns';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    fetch('/api/person', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setPeople(data);
        }
      });
  }, []);

  return (
    <div className='py-2'>
      <div className='border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Birthday</TableHead>
              <TableHead>Date Met</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead>AI Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((person) => (
              <TableRow key={person.id}>
                <TableCell>
                  {person.first_name} {person.last_name}
                </TableCell>
                <TableCell>{person.birthday ? format(new Date(person.birthday), 'PP') : 'Not set'}</TableCell>
                <TableCell>{person.date_met ? format(new Date(person.date_met), 'PP') : 'Not set'}</TableCell>
                <TableCell className='max-w-[200px] truncate'>{person.bio || 'No bio'}</TableCell>
                <TableCell className='max-w-[200px] truncate'>{person.ai_summary || 'No summary'}</TableCell>
              </TableRow>
            ))}
            {people.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  No contacts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
