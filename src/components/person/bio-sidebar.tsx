import { useParams } from 'next/navigation';
import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { Edit, Globe, Mail, MapPin, Phone } from '@/components/icons';
import { BioSidebarEdit } from '@/components/person/bio-sidebar-edit';
import { CustomFieldsSection } from '@/components/person/custom-fields-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyWithTooltip } from '@/components/ui/copy-with-tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useGroupMembers } from '@/hooks/use-group-members';
import { useGroups } from '@/hooks/use-groups';
import { TPersonEditFormData } from '@/lib/schemas/person-edit';
import type { Address, ContactMethod, Person, Website } from '@/types/database';

export interface BioSidebarData {
  person: Person;
  contactMethods?: ContactMethod[];
  addresses?: Address[];
  websites?: Website[];
}

export interface PersonBioSidebarProps {
  data: BioSidebarData | undefined;
}

export function PersonBioSidebar({ data }: PersonBioSidebarProps) {
  if (!data) return null;
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { data: groups } = useGroups();
  const personId = params.id as string;

  // Get the list of groups this person belongs to
  const personGroups =
    groups?.data?.filter((group) => {
      const { data: members } = useGroupMembers(group.id);
      return members?.some((member) => member.person_id === personId);
    }) || [];

  const handleEditSubmit = async (data: TPersonEditFormData) => {
    try {
      const response = await fetch(`/api/person/${params.id}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update');
      }

      setIsEditing(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['person', params.id]
        }),
        queryClient.invalidateQueries({
          queryKey: ['person', params.id, 'about']
        })
      ]);
      // TODO: Consistently handle errors in the application.
      // It's going to be really hard to debug otherwise
    } catch (error) {
      console.error('Failed to update person details:', error);
    }
  };

  return (
    <>
      <div className='relative flex flex-col space-y-8 overflow-y-auto'>
        {/* Edit Button */}
        <div className='absolute right-2 top-2'>
          <Button variant='ghost' size='sm' className='ml-auto' onClick={() => setIsEditing(true)}>
            <Edit className='size-4' />
          </Button>
        </div>

        {/* Bio Section */}
        {data.person.bio && (
          <section className='space-y-3'>
            <h3 className='text-sm font-semibold text-muted-foreground'>Bio</h3>
            <p className='text-sm'>{data.person.bio}</p>
          </section>
        )}

        {/* Contact Methods */}
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-muted-foreground'>Contact Information</h3>
          <div className='space-y-3'>
            {data.contactMethods?.map((method) => (
              <CopyWithTooltip key={method.id} content={method.value} side='left'>
                <div className='flex items-start space-x-2'>
                  {method.type === 'email' && (
                    <Mail className='mt-1 size-3.5 text-muted-foreground' />
                  )}
                  {method.type === 'phone' && (
                    <Phone className='mt-1 size-3.5 text-muted-foreground' />
                  )}
                  <div className='flex-1'>
                    <p className='text-sm'>{method.value}</p>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-muted-foreground'>{method.label}</span>
                      {method.is_primary && (
                        <Badge variant='secondary' className='h-4 px-1 py-0 text-[10px]'>
                          Primary
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CopyWithTooltip>
            ))}
          </div>
        </section>

        {/* Addresses */}
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-muted-foreground'>Addresses</h3>
          <div className='space-y-3'>
            {data.addresses?.map((address) => (
              <CopyWithTooltip
                key={address.id}
                side='left'
                content={`${address.street}, ${address.city}, ${address.state} ${address.postal_code} ${address.country}`}>
                <div className='flex items-start space-x-2'>
                  <MapPin className='mt-1 size-3.5 text-muted-foreground' />
                  <div>
                    <p className='text-sm'>{address.street}</p>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-muted-foreground'>
                        {address.city}, {address.state} {address.postal_code} {address.country}
                      </span>
                      {address.is_primary && (
                        <Badge variant='secondary' className='h-4 px-1 py-0 text-[10px]'>
                          Primary
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CopyWithTooltip>
            ))}
          </div>
        </section>

        {/* Websites */}
        {data.websites && data.websites.length > 0 && (
          <section className='space-y-3'>
            <h3 className='text-sm font-semibold text-muted-foreground'>Websites & Social</h3>
            <div className='space-y-2'>
              {data.websites?.map((website) => (
                <div key={website.id} className='flex items-center space-x-2'>
                  <Globe className='size-3.5 text-muted-foreground' />
                  <a
                    href={website.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-primary hover:underline'>
                    {website.label || website.url}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Organization-wide Custom Fields */}
        <CustomFieldsSection personId={personId} sectionType='person' />

        {/* Group-specific Custom Fields */}
        {personGroups.map((group: any) => (
          <CustomFieldsSection
            key={group.id}
            personId={personId}
            groupId={group.id}
            sectionType='group'
            groupName={group.name}
          />
        ))}

        {/* Record Details */}
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-muted-foreground'>Record Details</h3>
          <div className='space-y-1 text-xs text-muted-foreground'>
            <p>Last Updated: {new Date(data.person.updated_at).toLocaleDateString()}</p>
            <p>Created: {new Date(data.person.created_at).toLocaleDateString()}</p>
          </div>
        </section>
      </div>

      {/* Edit Form */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className='w-[800px] sm:w-[540px]'>
          <SheetHeader>
            <SheetTitle>Edit Profile Details</SheetTitle>
            {/* TODO: Change this color to be a nicer info color */}
            <Alert className='bg-destructive/10 text-destructive'>
              <AlertTitle>Friendly Reminder</AlertTitle>
              <AlertDescription>All of this can be edited through the chat.</AlertDescription>
            </Alert>
          </SheetHeader>
          <div className='no-scrollbar h-full overflow-y-auto py-6'>
            <BioSidebarEdit
              data={data}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
