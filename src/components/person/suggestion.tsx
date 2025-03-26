'use client';

type SuggestionProps = {
  suggestions: Array<{
    title: string;
    icon: string;
    insightRecommendation: string;
  }>;
};

export function Suggestion({ suggestions }: SuggestionProps) {
  return (
    <div className='flex flex-col'>
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className={`relative p-4 ${
            index === 0
              ? `rounded-t-lg border ${
                  index + 1 < suggestions.length ? 'border-b-0' : 'rounded-b-lg border-b'
                }`
              : index === suggestions.length - 1
                ? 'rounded-b-lg border border-t-0 pb-8'
                : 'border-x pb-4'
          } bg-orange-50`}>
          <div className='mb-1 flex items-center space-x-2'>
            <span className='text-amber-500'>{suggestion.icon}</span>
            <h4 className='text-xs font-medium uppercase tracking-wide text-amber-700'>
              {suggestion.title}
            </h4>
          </div>
          <p className='pl-7 text-gray-900'>{suggestion.insightRecommendation}</p>
          {index !== suggestions.length - 1 && (
            <div className='absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 transform bg-orange-200' />
          )}
        </div>
      ))}
    </div>
  );
}
