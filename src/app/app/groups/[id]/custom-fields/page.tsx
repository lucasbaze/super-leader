'use client';

import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft } from '@/components/icons';
import { CustomFieldsManager } from '@/components/settings/custom-fields/manager';
import { Button } from '@/components/ui/button';
import { useGroups } from '@/hooks/use-groups';

export default function GroupCustomFieldsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { data: groupData, isLoading } = useGroups();

  const handleBackClick = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className='container mx-auto space-y-6 py-6'>
        <div className='flex items-center'>
          <Button variant='ghost' size='sm' className='mr-4' onClick={handleBackClick}>
            <ArrowLeft className='mr-2 size-4' />
            Back
          </Button>
          <h1 className='text-3xl font-bold'>Group Custom Fields</h1>
        </div>
        <div className='flex justify-center py-8'>
          <p>Loading group information...</p>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className='container mx-auto space-y-6 py-6'>
        <div className='flex items-center'>
          <Button variant='ghost' size='sm' className='mr-4' onClick={handleBackClick}>
            <ArrowLeft className='mr-2 size-4' />
            Back
          </Button>
          <h1 className='text-3xl font-bold'>Group Custom Fields</h1>
        </div>
        <div className='flex justify-center py-8'>
          <p>Group not found</p>
        </div>
      </div>
    );
  }

  const group = groupData.find((group) => group.id === groupId);

  if (!group) {
    return (
      <div className='container mx-auto space-y-6 py-6'>
        <div className='flex items-center'>
          <Button variant='ghost' size='sm' className='mr-4' onClick={handleBackClick}>
            <ArrowLeft className='mr-2 size-4' />
            Back
          </Button>
          <h1 className='text-3xl font-bold'>Group Custom Fields</h1>
        </div>
        <div className='flex justify-center py-8'>
          <p>Group not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center'>
        <Button variant='ghost' size='sm' className='mr-4' onClick={handleBackClick}>
          <ArrowLeft className='mr-2 size-4' />
          Back
        </Button>
        <div>
          <h1 className='text-3xl font-bold'>{group.name} Custom Fields</h1>
          <p className='text-muted-foreground'>Manage custom fields specific to this group</p>
        </div>
      </div>

      <div className='pt-4'>
        <CustomFieldsManager
          entityType='person'
          groupId={groupId}
          title={`Custom Fields for ${group.name}`}
        />
      </div>
    </div>
  );
}
