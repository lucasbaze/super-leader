// Working example of column & row pinning. https://github.com/GlebKodrik/table

'use client';

import { CSSProperties } from 'react';

import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
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

// Working example of column & row pinning. https://github.com/GlebKodrik/table

interface TanStackPeopleTableProps {
  people: Person[];
  onRowClick?: (personId: string) => void;
  emptyMessage?: string;
}

const getCommonPinningStyles = (column: Column<Person>): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    position: isPinned ? 'sticky' : 'relative',
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    background: isPinned ? 'var(--background)' : undefined,
    boxShadow: isPinned === 'left' ? '4px 0 4px -4px rgba(0, 0, 0, 0.1)' : undefined,
    zIndex: isPinned ? 1 : 0
  };
};

export function PeopleTableV2({
  people,
  onRowClick,
  emptyMessage = 'No contacts found'
}: TanStackPeopleTableProps) {
  const columns: ColumnDef<Person>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 100,
      enablePinning: true,
      cell: ({ row }) => (
        <div
          className='flex cursor-pointer items-center gap-2'
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
      size: 120,
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
      size: 150,
      cell: ({ row }) => (
        <div className='flex items-center'>
          {row.original.birthday ? format(new Date(row.original.birthday), 'PP') : 'Not set'}
        </div>
      )
    },
    {
      accessorKey: 'date_met',
      header: 'Date Met',
      size: 150,
      cell: ({ row }) => (
        <div className='flex items-center'>
          {row.original.date_met ? format(new Date(row.original.date_met), 'PP') : 'Not set'}
        </div>
      )
    },
    {
      accessorKey: 'bio',
      header: 'Bio',
      size: 300,
      cell: ({ row }) => (
        <div className='max-w-[250px] truncate'>{row.original.bio || 'No bio'}</div>
      )
    },
    {
      accessorKey: 'ai_summary',
      header: 'AI Summary',
      size: 300,
      cell: ({ row }) => (
        <div className='max-w-[250px] truncate'>{row.original.ai_summary || 'No summary'}</div>
      )
    }
  ];

  const table = useReactTable({
    data: people,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 100,
      size: 150
    },
    state: {
      columnPinning: {
        left: ['name']
      }
    }
  });

  return (
    <div className='h-full'>
      <div className='h-full overflow-y-auto'>
        <div className='overflow-x-auto' style={{ position: 'relative' }}>
          <Table
            className='border-separate border-spacing-0'
            style={{ width: table.getTotalSize() }}>
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className='sticky top-0 bg-background'
                      style={{
                        width: header.getSize(),
                        ...getCommonPinningStyles(header.column)
                      }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className='border-b'
                      style={{
                        width: cell.column.getSize(),
                        ...getCommonPinningStyles(cell.column)
                      }}>
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
