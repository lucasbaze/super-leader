'use client';

import { useFiles } from '@/hooks/use-files';

export default function ImportsPage() {
  const { data: files, isLoading } = useFiles();

  return (
    <div className='mx-auto max-w-xl py-12'>
      <h1 className='mb-6 text-2xl font-bold'>Imports</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul className='space-y-2'>
          {files?.map((file) => (
            <li key={file.id} className='border p-2 rounded'>
              {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
