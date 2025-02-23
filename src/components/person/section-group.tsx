'use client';

type TSection = {
  title: string;
  icon: string;
  content: string;
  forYou: string;
};

export function SectionGroup({ sections }: { sections: TSection[] }) {
  return (
    <div className='flex flex-col space-y-4'>
      {sections.map((section, index) => (
        <div key={index} className='rounded-lg border border-gray-200 p-4'>
          <div className='mb-3 flex items-center space-x-2'>
            <span className='text-xl'>{section.icon}</span>
            <h3 className='text-lg font-semibold'>{section.title}</h3>
          </div>
          <p className='mb-3 text-gray-700'>{section.content}</p>
          <div className='rounded bg-blue-50 p-3'>
            <p className='text-sm text-blue-800'>
              <span className='font-semibold'>For you: </span>
              {section.forYou}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
