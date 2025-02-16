'use client';

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';

import { FollowUpIndicator } from '@/components/indicators/follow-up-indicator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Person } from '@/types/database';

interface TanStackPeopleTableProps {
  people: Person[];
  onRowClick?: (personId: string) => void;
  emptyMessage?: string;
}

export function PeopleTableV2({
  people,
  onRowClick,
  emptyMessage = 'No contacts found'
}: TanStackPeopleTableProps) {
  const columns: ColumnDef<Person>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div
          className='flex max-w-[200px] cursor-pointer items-center gap-2'
          onClick={() => onRowClick?.(row.original.id)}>
          <Avatar className='size-6 shrink-0'>
            <AvatarFallback className='text-xs'>{row.original.first_name?.[0]}</AvatarFallback>
          </Avatar>
          <span className='truncate'>
            {row.original.first_name} {row.original.last_name}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'follow_up_score',
      header: 'Follow Up',
      cell: ({ row }) => (
        <div className='flex items-center'>
          <FollowUpIndicator
            value={row.original.follow_up_score ?? 0}
            size='sm'
            personId={row.original.id}
            editable
          />
        </div>
      )
    },
    {
      accessorKey: 'birthday',
      header: 'Birthday',
      cell: ({ row }) => (
        <div className='flex items-center'>
          {row.original.birthday ? format(new Date(row.original.birthday), 'PP') : 'Not set'}
        </div>
      )
    },
    {
      accessorKey: 'date_met',
      header: 'Date Met',
      cell: ({ row }) => (
        <div className='flex items-center'>
          {row.original.date_met ? format(new Date(row.original.date_met), 'PP') : 'Not set'}
        </div>
      )
    },
    {
      accessorKey: 'bio',
      header: 'Bio',
      cell: ({ row }) => (
        <div className='flex max-w-[200px] items-center truncate'>
          {row.original.bio || 'No bio'}
        </div>
      )
    },
    {
      accessorKey: 'ai_summary',
      header: 'AI Summary',
      cell: ({ row }) => (
        <div className='flex max-w-[200px] items-center truncate'>
          {row.original.ai_summary || 'No summary'}
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: people,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className='absolute inset-0'>
      {/* Fixed Headers */}
      <div className='absolute inset-x-0 top-0 z-20 bg-background'>
        <div className='bg-background px-4'>
          <Table>
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='text-left'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='absolute inset-0 top-[40px] overflow-y-auto'>
        <div className='px-4'>
          <Table>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {people.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    {emptyMessage}
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
