'use client';

export function Highlights({ text }: { text: string }) {
  return (
    <div className='p-3'>
      <h3 className='mb-2 font-semibold'>Key Highlights</h3>
      <p className='text-gray-700'>{text}</p>
    </div>
  );
}
