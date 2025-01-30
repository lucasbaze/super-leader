import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LoadingPeople() {
  return (
    <div className='absolute inset-0'>
      {/* Fixed Headers */}
      <div className='absolute inset-x-0 top-0 z-20 border-b bg-background'>
        <div className='flex h-12 items-center justify-between px-4'>People filtering and viewing actions</div>
        <div className='border-b bg-background px-4'>
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
          </Table>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='absolute inset-0 top-[88px] overflow-y-auto'>
        <div className='px-4'>
          <Table>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className='h-4 w-[150px]' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-[100px]' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-[100px]' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-[200px]' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-[200px]' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
