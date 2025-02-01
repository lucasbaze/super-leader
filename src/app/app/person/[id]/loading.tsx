import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PersonLoading() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='border-b pb-4'>
        <Breadcrumb className='mb-4'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='/app/people'>People</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className='h-4 w-[120px]' />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className='flex items-center gap-4'>
          <Avatar className='size-16'>
            <AvatarFallback>
              <Skeleton className='size-full rounded-full' />
            </AvatarFallback>
          </Avatar>
          <div>
            <Skeleton className='mb-2 h-8 w-[200px]' />
            <div className='mt-1 flex gap-2'>
              <Skeleton className='h-5 w-16' />
              <Skeleton className='h-5 w-16' />
            </div>
          </div>
        </div>

        <Tabs defaultValue='activity' className='mt-6'>
          <TabsList>
            <TabsTrigger value='activity' disabled>
              Activity
            </TabsTrigger>
            <TabsTrigger value='emails' disabled>
              Emails
            </TabsTrigger>
            <TabsTrigger value='files' disabled>
              Files
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className='space-y-4'>
        <Skeleton className='h-7 w-[140px]' />
        <div className='space-y-3'>
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
        </div>
      </div>
    </div>
  );
}
