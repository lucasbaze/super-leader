'use client';

import { useState } from 'react';

import { Calendar, ExternalLink, MapPin, Search, Star, Users } from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Opportunity = {
  id: string;
  title: string;
  description: string;
  location: string;
  date?: string;
  url?: string;
  categories: string[];
  saved: boolean;
};

export function SuggestedConnections() {
  // Sample data - in a real app, this would come from an API
  const [events, setEvents] = useState<Opportunity[]>([
    {
      id: 'event-1',
      title: 'Houston Tech Rodeo',
      description: 'Annual gathering of tech entrepreneurs, investors, and innovators in Houston.',
      location: 'Houston, TX',
      date: 'April 15-20, 2023',
      url: 'https://example.com/houston-tech-rodeo',
      categories: ['Tech', 'Networking', 'Investors'],
      saved: false
    },
    {
      id: 'event-2',
      title: 'Bitcoin & Real Estate Summit',
      description:
        'Conference focused on the intersection of cryptocurrency and property development.',
      location: 'College Station, TX',
      date: 'May 5-6, 2023',
      url: 'https://example.com/bitcoin-realestate',
      categories: ['Bitcoin', 'Real Estate', 'Investment'],
      saved: false
    },
    {
      id: 'event-3',
      title: 'Family Office Investment Forum',
      description:
        'Exclusive gathering of family offices and wealth managers discussing investment strategies.',
      location: 'Houston, TX',
      date: 'June 12, 2023',
      url: 'https://example.com/family-office-forum',
      categories: ['Investment', 'Wealth Management', 'Networking'],
      saved: false
    }
  ]);

  const [groups, setGroups] = useState<Opportunity[]>([
    {
      id: 'group-1',
      title: 'Houston Real Estate Developers Association',
      description: 'Professional organization for real estate developers in the Houston area.',
      location: 'Houston, TX',
      url: 'https://example.com/hreda',
      categories: ['Real Estate', 'Professional', 'Local'],
      saved: false
    },
    {
      id: 'group-2',
      title: 'Texas Bitcoin Community',
      description: 'Group of Bitcoin enthusiasts, investors, and entrepreneurs in Texas.',
      location: 'Virtual & In-person (Texas)',
      url: 'https://example.com/texas-bitcoin',
      categories: ['Bitcoin', 'Investment', 'Technology'],
      saved: false
    },
    {
      id: 'group-3',
      title: 'College Station Business Alliance',
      description: 'Network of business leaders and entrepreneurs in College Station.',
      location: 'College Station, TX',
      url: 'https://example.com/csba',
      categories: ['Business', 'Local', 'Networking'],
      saved: false
    }
  ]);

  const [activities, setActivities] = useState<Opportunity[]>([
    {
      id: 'activity-1',
      title: 'Volunteer for Houston Startup Mentorship Program',
      description:
        'Mentor early-stage entrepreneurs and build connections with the startup ecosystem.',
      location: 'Houston, TX',
      categories: ['Mentorship', 'Startups', 'Giving Back'],
      saved: false
    },
    {
      id: 'activity-2',
      title: 'Host a Bitcoin & Leadership Roundtable',
      description:
        'Organize a small gathering to discuss Bitcoin investment strategies and leadership development with like-minded professionals.',
      location: 'Your choice (Houston or College Station)',
      categories: ['Bitcoin', 'Leadership', 'Networking'],
      saved: false
    },
    {
      id: 'activity-3',
      title: 'Attend City Council Meetings on Development',
      description:
        'Stay informed about local real estate regulations and connect with policy makers.',
      location: 'Houston & College Station, TX',
      categories: ['Real Estate', 'Policy', 'Local Government'],
      saved: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('events');

  const toggleSaved = (id: string, type: 'events' | 'groups' | 'activities') => {
    if (type === 'events') {
      setEvents(
        events.map((event) => (event.id === id ? { ...event, saved: !event.saved } : event))
      );
    } else if (type === 'groups') {
      setGroups(
        groups.map((group) => (group.id === id ? { ...group, saved: !group.saved } : group))
      );
    } else {
      setActivities(
        activities.map((activity) =>
          activity.id === id ? { ...activity, saved: !activity.saved } : activity
        )
      );
    }
  };

  const filterOpportunities = (items: Opportunity[]) => {
    if (!searchTerm) return items;

    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categories.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className='space-y-6'>
      <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800'>
        <h2 className='mb-4 text-2xl font-bold'>Connection Opportunities</h2>
        <p className='text-muted-foreground'>
          Discover events, groups, and activities where you can meet the people you need in your
          network. These suggestions are tailored to help you find connections in Houston and
          College Station areas.
        </p>
      </div>

      <div className='relative mb-6'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Search by keyword, category, or location...'
          className='pl-10'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue='events' className='w-full' onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='events'>Events</TabsTrigger>
          <TabsTrigger value='groups'>Groups</TabsTrigger>
          <TabsTrigger value='activities'>Activities</TabsTrigger>
        </TabsList>

        <TabsContent value='events' className='mt-6'>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filterOpportunities(events).map((event) => (
              <Card key={event.id}>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>{event.title}</CardTitle>
                  <CardDescription className='flex items-center gap-1'>
                    <MapPin className='h-3.5 w-3.5' />
                    {event.location}
                  </CardDescription>
                  {event.date && (
                    <CardDescription className='flex items-center gap-1'>
                      <Calendar className='h-3.5 w-3.5' />
                      {event.date}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className='text-sm'>{event.description}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {event.categories.map((category) => (
                      <Badge key={category} variant='secondary' className='text-xs'>
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className='flex justify-between'>
                  <Button
                    variant={event.saved ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => toggleSaved(event.id, 'events')}>
                    {event.saved ? 'Saved' : 'Save'}
                  </Button>
                  {event.url && (
                    <Button variant='ghost' size='sm' asChild>
                      <a href={event.url} target='_blank' rel='noopener noreferrer'>
                        <ExternalLink className='mr-2 h-4 w-4' />
                        Details
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='groups' className='mt-6'>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filterOpportunities(groups).map((group) => (
              <Card key={group.id}>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>{group.title}</CardTitle>
                  <CardDescription className='flex items-center gap-1'>
                    <MapPin className='h-3.5 w-3.5' />
                    {group.location}
                  </CardDescription>
                  <CardDescription className='flex items-center gap-1'>
                    <Users className='h-3.5 w-3.5' />
                    Professional Group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-sm'>{group.description}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {group.categories.map((category) => (
                      <Badge key={category} variant='secondary' className='text-xs'>
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className='flex justify-between'>
                  <Button
                    variant={group.saved ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => toggleSaved(group.id, 'groups')}>
                    {group.saved ? 'Saved' : 'Save'}
                  </Button>
                  {group.url && (
                    <Button variant='ghost' size='sm' asChild>
                      <a href={group.url} target='_blank' rel='noopener noreferrer'>
                        <ExternalLink className='mr-2 h-4 w-4' />
                        Visit
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='activities' className='mt-6'>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filterOpportunities(activities).map((activity) => (
              <Card key={activity.id}>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>{activity.title}</CardTitle>
                  <CardDescription className='flex items-center gap-1'>
                    <MapPin className='h-3.5 w-3.5' />
                    {activity.location}
                  </CardDescription>
                  <CardDescription className='flex items-center gap-1'>
                    <Star className='h-3.5 w-3.5' />
                    Recommended Activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-sm'>{activity.description}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {activity.categories.map((category) => (
                      <Badge key={category} variant='secondary' className='text-xs'>
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={activity.saved ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => toggleSaved(activity.id, 'activities')}
                    className='w-full'>
                    {activity.saved ? 'Saved to My Plan' : 'Add to My Plan'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
