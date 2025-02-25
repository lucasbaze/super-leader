'use client';

import { BookmarksHeader } from '@/components/bookmarks/bookmarks-header';

export default function BookmarksPage() {
  return (
    <div className='absolute inset-0'>
      <div className='mb-4 flex flex-col rounded-t-md border-b bg-background'>
        <BookmarksHeader />
      </div>
      <div className='absolute inset-0 top-[48px] mt-[1px]'>
        {/* Content will go here */}
        <div className='p-4'>
          <i>Bookmarks page content will go here</i>
        </div>
      </div>
    </div>
  );
}
