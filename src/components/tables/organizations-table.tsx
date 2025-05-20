'use client';

import { CSSProperties } from 'react';

import { type Column, type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Organization } from '@/types/database';

interface OrganizationsTableProps {
  organizations: Organization[];
  onRowClick?: (organizationId: number) => void;
  emptyMessage?: string;
}

const getCommonPinningStyles = (column: Column<Organization>): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    position: isPinned ? 'sticky' : 'relative',
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    boxShadow: isPinned === 'left' ? '4px 0 4px -4px rgba(0, 0, 0, 0.1)' : undefined,
    zIndex: isPinned ? 1 : 0
  };
};

export function OrganizationsTable({
  organizations,
  onRowClick,
  emptyMessage = 'No organizations found'
}: OrganizationsTableProps) {
  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: 'name',
      header: () => <div className='pl-3'>Name</div>,
      size: 100,
      enablePinning: true,
      cell: ({ row }) => (
        <div className='flex cursor-pointer items-center gap-2 pl-3' onClick={() => onRowClick?.(row.original.id)}>
          <Avatar className='size-6 shrink-0'>
            <AvatarFallback className='text-xs'>{row.original.name[0]}</AvatarFallback>
          </Avatar>
          <span className='truncate'>{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'url',
      header: 'Website',
      size: 200,
      cell: ({ row }) => (
        <div className='flex items-center'>
          {row.original.url ? (
            <a
              href={row.original.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline'>
              {row.original.url}
            </a>
          ) : (
            'No website'
          )}
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: organizations,
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
          <Table className='border-separate border-spacing-0' style={{ width: table.getTotalSize() }}>
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
            <TableBody className='no-scrollbar'>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className='border-b bg-white hover:bg-accent'
                      style={{
                        width: cell.column.getSize(),
                        ...getCommonPinningStyles(cell.column)
                      }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {organizations.length === 0 && (
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
