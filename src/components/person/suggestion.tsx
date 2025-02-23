'use client';

type TSuggestion = {
  content: string;
  reason: string;
};

export function Suggestion({ content, reason }: TSuggestion) {
  return (
    <div className='rounded-lg bg-green-50 p-4'>
      <div className='mb-2 flex items-center space-x-2'>
        <span className='text-xl'>💡</span>
        <h4 className='font-semibold'>Suggestion</h4>
      </div>
      <p className='mb-2 text-green-800'>{content}</p>
      <p className='text-sm text-green-700'>
        <span className='font-semibold'>Why: </span>
        {reason}
      </p>
    </div>
  );
}
