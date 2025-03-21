'use client';

import { useState } from 'react';

import { Check, Info, Plus } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Progress } from './progress';

// Define the network category type
type Contact = {
  id: string;
  name: string;
};

type NetworkCategory = {
  id: string;
  name: string;
  description: string;
  importance: string;
  targetCount: number;
  contacts: Contact[];
};

export function NetworkCategories() {
  // Initial network categories based on the provided data
  const [categories, setCategories] = useState<NetworkCategory[]>([
    {
      id: 'industry-experts',
      name: 'Industry Experts',
      description: 'People with deep knowledge in your field',
      importance: 'Gain deep insights for your Superleader tool and Bitcoin ventures.',
      targetCount: 5,
      contacts: []
    },
    {
      id: 'adjacent-industry',
      name: 'Adjacent Industry Connectors',
      description: 'People from related fields who can provide fresh perspectives',
      importance: 'Get fresh perspectives on design, fintech, real estate, and AI.',
      targetCount: 4,
      contacts: []
    },
    {
      id: 'decision-makers',
      name: 'High-Level Decision Makers',
      description: 'VCs, CEOs, and other executives',
      importance: 'Open doors for partnerships, investments, and large-scale deals.',
      targetCount: 3,
      contacts: []
    },
    {
      id: 'investors',
      name: 'Investors & Financial Advisors',
      description: 'People who can provide funding and financial guidance',
      importance:
        'Provide funding opportunities, financial strategy, and connections to grow your personal wealth & business.',
      targetCount: 4,
      contacts: []
    },
    {
      id: 'media-pr',
      name: 'Media & Public Relations Experts',
      description: 'People who can help increase your visibility',
      importance: 'Increase visibility for Superleader, build personal & business brand.',
      targetCount: 2,
      contacts: []
    },
    {
      id: 'government-policy',
      name: 'Government & Policy Makers',
      description: 'People who can help navigate regulations',
      importance: 'Help navigate regulations (especially around Bitcoin & real estate).',
      targetCount: 2,
      contacts: []
    },
    {
      id: 'mentors-coaches',
      name: 'Mentors & Coaches',
      description: 'People who can provide guidance and advice',
      importance: 'Offer guidance in pitching, interpersonal communication, and scale-up.',
      targetCount: 3,
      contacts: []
    },
    {
      id: 'community-leaders',
      name: 'Community & Ecosystem Leaders',
      description: 'People who can facilitate introductions',
      importance:
        'Facilitate introductions to networks (particularly in College Station, Houston, and real estate).',
      targetCount: 3,
      contacts: []
    },
    {
      id: 'technical-experts',
      name: 'Technical Experts',
      description: 'People with specialized technical skills',
      importance: "Contribute specialized skills to Superleader's design and functionality.",
      targetCount: 4,
      contacts: []
    },
    {
      id: 'emerging-leaders',
      name: 'Young & Emerging Leaders',
      description: 'People who bring fresh perspectives',
      importance: 'Bring fresh perspectives, new trends, and future market insights.',
      targetCount: 3,
      contacts: []
    },
    {
      id: 'diverse-thinkers',
      name: 'Diverse Thinkers & Contrarians',
      description: 'People who challenge your assumptions',
      importance: 'Challenge your assumptions, bring contrarian views, and avoid groupthink.',
      targetCount: 3,
      contacts: []
    }
  ]);

  const [newCategory, setNewCategory] = useState('');
  const [newContactName, setNewContactName] = useState<{ [key: string]: string }>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Calculate total progress
  const totalContacts = categories.reduce((sum, category) => sum + category.contacts.length, 0);
  const totalTargets = categories.reduce((sum, category) => sum + category.targetCount, 0);
  const overallProgress = Math.round((totalContacts / totalTargets) * 100);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([
        ...categories,
        {
          id: `custom-${Date.now()}`,
          name: newCategory,
          description: 'Custom category',
          importance: 'Your custom networking category',
          targetCount: 3,
          contacts: []
        }
      ]);
      setNewCategory('');
    }
  };

  const handleAddContact = (categoryId: string) => {
    if (newContactName[categoryId]?.trim()) {
      setCategories(
        categories.map((category) => {
          if (category.id === categoryId) {
            return {
              ...category,
              contacts: [
                ...category.contacts,
                { id: `contact-${Date.now()}`, name: newContactName[categoryId] }
              ]
            };
          }
          return category;
        })
      );
      setNewContactName({ ...newContactName, [categoryId]: '' });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800'>
        <h2 className='mb-4 text-2xl font-bold'>Network Progress</h2>
        <div className='mb-2 flex justify-between'>
          <span>Overall Completion</span>
          <span className='font-medium'>{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className='h-2' />
        <p className='mt-4 text-sm text-muted-foreground'>
          You've added {totalContacts} out of {totalTargets} recommended connections
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {categories.map((category) => (
          <Card key={category.id} className='overflow-hidden'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <CardTitle className='text-lg'>{category.name}</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-6 w-6'>
                        <Info className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs'>
                      <p>{category.importance}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className='pb-2'>
              <div className='mb-2 flex justify-between text-sm'>
                <span>Progress</span>
                <span>
                  {category.contacts.length}/{category.targetCount}
                </span>
              </div>
              <Progress
                value={(category.contacts.length / category.targetCount) * 100}
                className='h-2'
              />

              <Accordion
                type='single'
                collapsible
                className='mt-4'
                value={expandedCategory === category.id ? category.id : undefined}
                onValueChange={(value) => setExpandedCategory(value)}>
                <AccordionItem value={category.id} className='border-none'>
                  <AccordionTrigger className='py-2 text-sm'>
                    {category.contacts.length > 0 ? 'View Connections' : 'Add Connections'}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-3'>
                      {category.contacts.map((contact) => (
                        <div key={contact.id} className='flex items-center rounded-md bg-muted p-2'>
                          <Check className='mr-2 h-4 w-4 text-green-500' />
                          <span>{contact.name}</span>
                        </div>
                      ))}

                      <div className='flex items-center gap-2'>
                        <Input
                          placeholder='Add a contact name'
                          value={newContactName[category.id] || ''}
                          onChange={(e) =>
                            setNewContactName({ ...newContactName, [category.id]: e.target.value })
                          }
                          className='h-9'
                        />
                        <Button
                          size='sm'
                          onClick={() => handleAddContact(category.id)}
                          disabled={!newContactName[category.id]?.trim()}>
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className='pt-2'>
              <Badge variant='outline' className='text-xs'>
                Target: {category.targetCount}
              </Badge>
            </CardFooter>
          </Card>
        ))}

        {/* Add new category card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Add Custom Category</CardTitle>
            <CardDescription>Create your own networking category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <Input
                placeholder='New category name'
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
