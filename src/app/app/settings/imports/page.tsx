'use client';

import { ImportCSVButton } from '@/components/people/import-csv-button';
import { useFiles } from '@/hooks/use-files';

export default function ImportsPage() {
  const { data: files, isLoading } = useFiles();

  return (
    <div className='mx-auto max-w-xl py-12'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Contact Imports</h1>
        <ImportCSVButton />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul className='space-y-2'>
          {files?.map((file) => (
            <li key={file.id} className='rounded border p-2'>
              {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
