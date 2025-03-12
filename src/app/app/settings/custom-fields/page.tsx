'use client';

import { CustomFieldsManager } from '@/components/settings/custom-fields/manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CustomFieldsSettingsPage() {
  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div>
        <h1 className='mb-2 text-xl font-bold'>Custom Fields</h1>
        <p className='text-muted-foreground'>Manage custom fields for people and groups</p>
      </div>

      <Tabs defaultValue='person'>
        <TabsList>
          <TabsTrigger value='person'>People Fields</TabsTrigger>
          <TabsTrigger value='group'>Group Fields</TabsTrigger>
        </TabsList>

        <TabsContent value='person' className='pt-4'>
          <CustomFieldsManager entityType='person' title='All People Fields' />
        </TabsContent>

        <TabsContent value='group' className='pt-4'>
          <CustomFieldsManager entityType='group' title='All Group Fields' />
        </TabsContent>
      </Tabs>
    </div>
  );
}
