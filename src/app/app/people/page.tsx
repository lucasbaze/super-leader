import { headers } from 'next/headers';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Person } from '@/types/people';
import { createClient } from '@/utils/supabase/server';

import { format } from 'date-fns';

async function getPeople(): Promise<Person[]> {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const protocol = process?.env?.NODE_ENV === 'development' ? 'http' : 'https';

    const response = await fetch(`${protocol}://${host}/api/person`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        // Handle error appropriately
        return [];
    }

    const data = await response.json();
    console.log(data);
    return data;
}

export default async function PeoplePage() {
    const people = await getPeople();

    return (
        <div className='p-6'>
            <div className='rounded-md border'>
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
