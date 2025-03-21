'use client';

import { useState } from 'react';

import { MoveRight } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { NetworkCategories } from './network-categories';
import { ShareValueAsk } from './share-value-ask';
import { SuggestedConnections } from './suggested-connections';

export function NetworkDashboard() {
  const [activeTab, setActiveTab] = useState('network');

  return (
    <div className='container mx-auto px-4 py-8'>
      <header className='mb-8 text-center'>
        <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
          Your Relationship Game Plan
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Build a strategic network that supports your goals
        </p>
      </header>

      <div className='mb-6 flex items-center justify-center space-x-2'>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${activeTab === 'network' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          1
        </div>
        <MoveRight className='h-4 w-4 text-muted-foreground' />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${activeTab === 'strategy' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          2
        </div>
        <MoveRight className='h-4 w-4 text-muted-foreground' />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${activeTab === 'opportunities' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          3
        </div>
      </div>

      <Tabs defaultValue='network' className='w-full' onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='network'>Network Categories</TabsTrigger>
          <TabsTrigger value='strategy'>Share, Value-Add, Ask</TabsTrigger>
          <TabsTrigger value='opportunities'>Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value='network' className='mt-6'>
          <NetworkCategories />
        </TabsContent>

        <TabsContent value='strategy' className='mt-6'>
          <ShareValueAsk />
        </TabsContent>

        <TabsContent value='opportunities' className='mt-6'>
          <SuggestedConnections />
        </TabsContent>
      </Tabs>
    </div>
  );
}
