'use client';

import { Info } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type TProfileCompletenessProps = {
  value: number;
  questions: string[];
};

export function ProfileCompleteness({ value, questions }: TProfileCompletenessProps) {
  return (
    <div className='flex flex-col border-b'>
      {/* Header with percentage */}
      <div className='flex min-w-[300px] items-center justify-between px-4 pb-0 pt-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Profile Completeness</span>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='size-4 text-muted-foreground' />
              </TooltipTrigger>
              <TooltipContent
                className='max-h-36 w-80 overflow-y-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md'
                sideOffset={10}
                align='center'
                side='right'>
                <div className='space-y-2'>
                  <h4 className='mb-1 font-medium'>How this is calculated</h4>
                  <p>
                    Superleader uses a combination of your notes, interactions, and activity to
                    determine a person's profile completeness across multiple dimensions such as:
                  </p>
                  <ul className='list-disc pl-4'>
                    <li>Personal Information</li>
                    <li>Professional Information</li>
                    <li>Values & Beliefs</li>
                    <li>Goals & Aspirations</li>
                    <li>Interests & Hobbies</li>
                    <li>Strengths & Challenges</li>
                    <li>Ecosystems & Networks</li>
                  </ul>
                  <p>
                    These key dimensions enables Superleader to provide more accurate and relevant
                    suggestions and insights.
                  </p>
                  <p>
                    Also, gathering this information in a genuine and authentic way helps you deepen
                    your relationships with others.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className='text-sm font-medium'>{value}%</span>
      </div>

      {/* Expandable Questions Section */}
      <div className='bg-muted/5'>
        <Accordion type='single' collapsible>
          <AccordionItem value='questions' className='border-none'>
            <AccordionTrigger className='px-4 py-3 text-sm hover:no-underline'>
              <span className='font-light text-muted-foreground'>Improve profile score</span>
            </AccordionTrigger>
            <AccordionContent className='pb-3'>
              <div className='space-y-2 pl-6'>
                <ul className='list-disc space-y-1 px-6 pb-2 pl-4'>
                  {questions.map((question, index) => (
                    <li key={index}>
                      <span className='text-sm text-muted-foreground'>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
