'use client';

type TSuggestion = {
  content: string;
  reason: string;
};

export function Suggestion({ content, reason }: TSuggestion) {
  return (
    <div className='relative -mt-2 rounded-b-lg border border-gray-200 bg-orange-50 p-4'>
      <div className='mb-2 flex items-center space-x-2'>
        <span className='text-amber-500'>💡</span>
        <h4 className='text-xs font-medium uppercase tracking-wide text-amber-700'>Insight</h4>
      </div>
      <p className='mb-2 pl-6 text-sm text-gray-900'>{content}</p>
      <p className='pl-6 text-xs text-gray-600'>
        <span className='font-medium'>Why: </span>
        {reason}
      </p>
    </div>
  );
}
