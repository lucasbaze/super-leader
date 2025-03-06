'use client';

export function Completeness({ value }: { value: number }) {
  return (
    <div className='flex items-center space-x-4'>
      <div className='h-2 flex-1 rounded-full bg-gray-200'>
        <div className='h-2 rounded-full bg-green-500' style={{ width: `${value}%` }} />
      </div>
      <span className='text-sm font-medium'>{value}% Complete</span>
    </div>
  );
}
