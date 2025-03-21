'use client';

import { useState } from 'react';

import { Check, Copy, Edit2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type ContentSection = {
  id: string;
  title: string;
  content: string;
  isEditing: boolean;
};

export function ShareValueAsk() {
  // This would normally be populated from the user's profile data
  const [sections, setSections] = useState<ContentSection[]>([
    {
      id: 'share-personal',
      title: 'Personal Story',
      content:
        "I'm a retired tech entrepreneur focused on building Superleader, a tool to help people develop leadership skills. I'm also passionate about Bitcoin and real estate development in the Houston and College Station areas.",
      isEditing: false
    },
    {
      id: 'share-professional',
      title: 'Professional Background',
      content:
        "I have experience building and scaling tech companies, with a focus on user experience design and product development. I've worked with various startups and have a strong understanding of the entrepreneurial ecosystem.",
      isEditing: false
    },
    {
      id: 'value-expertise',
      title: 'Expertise & Knowledge',
      content:
        "I can offer insights on product development, UX design, and startup growth strategies. I'm also knowledgeable about Bitcoin investments and real estate development opportunities in Texas.",
      isEditing: false
    },
    {
      id: 'value-connections',
      title: 'Connections & Resources',
      content:
        'I have connections in the tech startup community and can make introductions to potential partners, investors, and talent. I also have resources related to leadership development and Bitcoin investment strategies.',
      isEditing: false
    },
    {
      id: 'ask-advice',
      title: 'Seeking Advice',
      content:
        "I'm looking for guidance on scaling Superleader and navigating regulations around Bitcoin and real estate development. I'd appreciate insights on current market trends and opportunities.",
      isEditing: false
    },
    {
      id: 'ask-introductions',
      title: 'Requesting Introductions',
      content:
        "I'm interested in connecting with investors focused on leadership tech and Bitcoin, as well as real estate developers in the Houston and College Station areas. I'm also looking to meet policy makers who can help navigate regulations.",
      isEditing: false
    }
  ]);

  const [editContent, setEditContent] = useState<{ [key: string]: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleEdit = (id: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === id) {
          if (!section.isEditing) {
            setEditContent({ ...editContent, [id]: section.content });
          }
          return { ...section, isEditing: !section.isEditing };
        }
        return section;
      })
    );
  };

  const handleSave = (id: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === id) {
          return {
            ...section,
            content: editContent[id] || section.content,
            isEditing: false
          };
        }
        return section;
      })
    );
  };

  return (
    <div className='space-y-6'>
      <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800'>
        <h2 className='mb-4 text-2xl font-bold'>Your Personalized Networking Strategy</h2>
        <p className='text-muted-foreground'>
          Use these personalized talking points to effectively connect with people in your network.
          Each section is tailored based on your profile and can be customized further.
        </p>
      </div>

      <Tabs defaultValue='share' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='share'>Share</TabsTrigger>
          <TabsTrigger value='value'>Value-Add</TabsTrigger>
          <TabsTrigger value='ask'>Ask</TabsTrigger>
        </TabsList>

        <TabsContent value='share' className='mt-6 space-y-6'>
          <p className='text-muted-foreground'>
            Share your story to build rapport and establish common ground. This helps people
            understand who you are and what you care about.
          </p>

          {sections
            .filter((section) => section.id.startsWith('share'))
            .map((section) => (
              <Card key={section.id}>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>{section.title}</CardTitle>
                  <CardDescription>What to share about yourself</CardDescription>
                </CardHeader>
                <CardContent>
                  {section.isEditing ? (
                    <div className='space-y-2'>
                      <Textarea
                        value={editContent[section.id] || ''}
                        onChange={(e) =>
                          setEditContent({ ...editContent, [section.id]: e.target.value })
                        }
                        className='min-h-[100px]'
                      />
                      <div className='flex justify-end space-x-2'>
                        <Button variant='outline' size='sm' onClick={() => toggleEdit(section.id)}>
                          Cancel
                        </Button>
                        <Button size='sm' onClick={() => handleSave(section.id)}>
                          <Save className='mr-2 h-4 w-4' />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <p>{section.content}</p>
                      <div className='flex justify-end space-x-2'>
                        <Button variant='outline' size='sm' onClick={() => toggleEdit(section.id)}>
                          <Edit2 className='mr-2 h-4 w-4' />
                          Edit
                        </Button>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={() => handleCopy(section.id, section.content)}>
                          {copiedId === section.id ? (
                            <>
                              <Check className='mr-2 h-4 w-4' />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className='mr-2 h-4 w-4' />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value='value' className='mt-6 space-y-6'>
          <p className='text-muted-foreground'>
            Highlight what you can offer to others. This demonstrates your value and makes people
            more likely to want to help you.
          </p>

          {sections
            .filter((section) => section.id.startsWith('value'))
            .map((section) => (
              <Card key={section.id}>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>{section.title}</CardTitle>
                  <CardDescription>What you can offer to others</CardDescription>
                </CardHeader>
                <CardContent>
                  {section.isEditing ? (
                    <div className='space-y-2'>
                      <Textarea
                        value={editContent[section.id] || ''}
                        onChange={(e) =>
                          setEditContent({ ...editContent, [section.id]: e.target.value })
                        }
                        className='min-h-[100px]'
                      />
                      <div className='flex justify-end space-x-2'>
                        <Button variant='outline' size='sm' onClick={() => toggleEdit(section.id)}>
                          Cancel
                        </Button>
                        <Button size='sm' onClick={() => handleSave(section.id)}>
                          <Save className='mr-2 h-4 w-4' />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <p>{section.content}</p>
                      <div className='flex justify-end space-x-2'>
                        <Button variant='outline' size='sm' onClick={() => toggleEdit(section.id)}>
                          <Edit2 className='mr-2 h-4 w-4' />
                          Edit
                        </Button>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={() => handleCopy(section.id, section.content)}>
                          {copiedId === section.id ? (
                            <>
                              <Check className='mr-2 h-4 w-4' />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className='mr-2 h-4 w-4' />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value='ask' className='mt-6 space-y-6'>
          <p className='text-muted-foreground'>
            Be clear about what you're looking for. After building rapport and offering value, make
            specific requests that others can help with.
          </p>

          {sections
            .filter((section) => section.id.startsWith('ask'))
            .map((section) => (
              <Card key={section.id}>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>{section.title}</CardTitle>
                  <CardDescription>What you need from others</CardDescription>
                </CardHeader>
                <CardContent>
                  {section.isEditing ? (
                    <div className='space-y-2'>
                      <Textarea
                        value={editContent[section.id] || ''}
                        onChange={(e) =>
                          setEditContent({ ...editContent, [section.id]: e.target.value })
                        }
                        className='min-h-[100px]'
                      />
                      <div className='flex justify-end space-x-2'>
                        <Button variant='outline' size='sm' onClick={() => toggleEdit(section.id)}>
                          Cancel
                        </Button>
                        <Button size='sm' onClick={() => handleSave(section.id)}>
                          <Save className='mr-2 h-4 w-4' />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <p>{section.content}</p>
                      <div className='flex justify-end space-x-2'>
                        <Button variant='outline' size='sm' onClick={() => toggleEdit(section.id)}>
                          <Edit2 className='mr-2 h-4 w-4' />
                          Edit
                        </Button>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={() => handleCopy(section.id, section.content)}>
                          {copiedId === section.id ? (
                            <>
                              <Check className='mr-2 h-4 w-4' />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className='mr-2 h-4 w-4' />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
