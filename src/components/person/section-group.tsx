'use client';

type TSection = {
  title: string;
  icon: string;
  content: string;
  forYou: string;
};

export function SectionGroup({ sections }: { sections: TSection[] }) {
  return (
    <div className='flex flex-col'>
      {sections.map((section, index) => (
        <div
          key={index}
          className={`relative p-4 ${
            index === 0
              ? `rounded-t-lg border ${index + 1 < sections.length ? 'border-b-0' : 'rounded-b-lg border-b'}`
              : index === sections.length - 1
                ? 'rounded-b-lg border border-t-0 pb-8'
                : 'border-x pb-4'
          }`}>
          <div className='mb-1 flex items-center space-x-2'>
            <span className='text-sm'>{section.icon}</span>
            <h3 className='text-xs uppercase tracking-wide text-gray-500'>{section.title}</h3>
          </div>
          <p className='pl-6 text-gray-700'>{section.content}</p>
          {/* Commenting out forYou content for now
          <div className='mt-3 rounded bg-blue-50 p-3'>
            <p className='text-sm text-blue-800'>
              <span className='font-semibold'>For you: </span>
              {section.forYou}
            </p>
          </div>
          */}
          {index !== sections.length - 1 && (
            <div className='absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 transform bg-gray-200' />
          )}
        </div>
      ))}
    </div>
  );
}
