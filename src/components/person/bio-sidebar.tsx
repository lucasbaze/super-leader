import { useParams } from 'next/navigation';

import { AddressPopover } from '@/components/editable/address-popover';
import { ContactMethodPopover } from '@/components/editable/contact-method-popover';
import { EditableDate } from '@/components/editable/editable-date';
import { EditableField } from '@/components/editable/editable-field';
import { WebsitePopover } from '@/components/editable/website-popover';
import { Loader, Plus } from '@/components/icons';
import { CustomFieldsSection } from '@/components/person/custom-fields-section';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCustomFieldValues } from '@/hooks/use-custom-fields';
import { UsePersonHookResult } from '@/hooks/use-person';
import { usePersonUpdates } from '@/hooks/use-person-updates';
import { PersonGroup } from '@/types/custom';
import type { Address, ContactMethod, Person, Website } from '@/types/database';

import { OrganizationBadge } from '../organizations/organization-badge';
import { PersonBadge } from './person-badge';

export interface PersonBioSidebarProps {
  person: Person | undefined;
  contactMethods?: ContactMethod[];
  addresses?: Address[];
  websites?: Website[];
  groups?: PersonGroup[];
  organizations?: { id: string; name: string }[];
  associatedPeople?: UsePersonHookResult['personPersonRelations'];
}

// Custom Fields Section with Separator
function CustomFieldsSectionWithSeparator({
  personId,
  groupId,
  sectionType,
  groupName
}: {
  personId: string;
  groupId?: string;
  sectionType: 'person' | 'group';
  groupName?: string;
}) {
  const { fields, isLoading } = useCustomFieldValues(groupId || personId, sectionType);
  const hasFields = !isLoading && fields && fields.length > 0;

  if (!hasFields) return null;

  return (
    <>
      <CustomFieldsSection personId={personId} groupId={groupId} sectionType={sectionType} groupName={groupName} />
      <Separator />
    </>
  );
}

export function PersonBioSidebar({
  person,
  contactMethods,
  addresses,
  websites,
  groups,
  organizations,
  associatedPeople
}: PersonBioSidebarProps) {
  if (!person) return null;

  const params = useParams();
  const personId = params.id as string;

  const updates = usePersonUpdates({ personId });

  // Organizations Section
  const renderAssociatedPeople = () => {
    return associatedPeople && associatedPeople.length > 0 ? (
      <>
        <div>
          <h3 className='mb-4 text-sm font-semibold text-muted-foreground'>Associated People</h3>
          <div className='flex flex-wrap gap-2'>
            {associatedPeople.map((person) => (
              <TooltipProvider delayDuration={0} key={person.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex w-fit cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground'>
                      <PersonBadge key={person.id} person={{ id: person.id, name: person.name }} asLink />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    className='max-h-24 w-80 overflow-y-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md'
                    sideOffset={10}>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium'>{person.relation}</p>
                      <p className='text-xs text-muted-foreground'>{person.note}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
        <Separator />
      </>
    ) : null;
  };

  // Organizations Section
  const renderOrganizations = () => {
    return organizations && organizations.length > 0 ? (
      <div>
        <h3 className='mb-4 text-sm font-semibold text-muted-foreground'>Organizations</h3>
        <div className='flex flex-wrap gap-2'>
          {organizations.map((organization) => (
            <OrganizationBadge key={organization.id} organization={organization} asLink />
          ))}
        </div>
      </div>
    ) : null;
  };

  // Custom Fields Sections
  const renderPersonCustomFields = () => {
    return <CustomFieldsSectionWithSeparator personId={personId} sectionType='person' />;
  };

  // Group Custom Fields Sections
  const renderGroupCustomFields = () => {
    return groups?.map((group) => (
      <CustomFieldsSectionWithSeparator
        key={group.id}
        personId={personId}
        groupId={group.id}
        sectionType='group'
        groupName={group.name}
      />
    ));
  };

  // Basic Information Section
  const renderBasicInfo = () => (
    <section className='space-y-1'>
      <h3 className='text-sm font-semibold text-muted-foreground'>Basic Information</h3>
      <div className='space-y-2'>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>Birthday</label>
          <EditableDate
            value={person.birthday}
            onChange={(value) => updates.updateField('birthday', value)}
            placeholder='Select birthday'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>Date Met</label>
          <EditableDate
            value={person.date_met}
            onChange={(value) => updates.updateField('date_met', value)}
            placeholder='Select date met'
          />
        </div>
      </div>
    </section>
  );

  // Contact Methods Section
  const renderContactMethods = () => (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Contact Information</h3>
        <ContactMethodPopover
          contactMethod={{
            type: 'email',
            value: '',
            label: '',
            is_primary: false
          }}
          onSave={(data) => updates.updateContactMethod(undefined, data)}
          trigger={
            <Button variant='ghost' size='sm' className='size-6 p-0'>
              <Plus className='size-4' />
            </Button>
          }
        />
      </div>
      <div className='space-y-2'>
        {contactMethods?.map((method) => (
          <ContactMethodPopover
            key={method.id}
            contactMethod={{
              type: method.type,
              value: method.value,
              label: method.label || undefined,
              is_primary: method.is_primary || false
            }}
            onSave={(data) => updates.updateContactMethod(method.id, data)}
            onDelete={method.id ? () => updates.deleteContactMethod(method.id!) : undefined}
          />
        ))}
      </div>
    </section>
  );

  // Addresses Section
  const renderAddresses = () => (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Addresses</h3>
        <AddressPopover
          address={{
            street: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            label: '',
            is_primary: false
          }}
          onSave={(data) => updates.updateAddress(undefined, data)}
          trigger={
            <Button variant='ghost' size='sm' className='size-6 p-0'>
              <Plus className='size-4' />
            </Button>
          }
        />
      </div>
      <div className='space-y-2'>
        {addresses?.map((address) => (
          <AddressPopover
            key={address.id}
            address={{
              street: address.street || '',
              city: address.city || '',
              state: address.state || '',
              postal_code: address.postal_code || '',
              country: address.country || '',
              label: address.label || undefined,
              is_primary: address.is_primary || false
            }}
            onSave={(data) => updates.updateAddress(address.id, data)}
            onDelete={address.id ? () => updates.deleteAddress(address.id!) : undefined}
          />
        ))}
      </div>
    </section>
  );

  // Websites Section
  const renderWebsites = () => (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Websites & Social</h3>
        <WebsitePopover
          website={{
            url: '',
            label: ''
          }}
          onSave={(data) => updates.updateWebsite(undefined, data)}
          trigger={
            <Button variant='ghost' size='sm' className='size-6 p-0'>
              <Plus className='size-4' />
            </Button>
          }
        />
      </div>
      <div className='space-y-2'>
        {websites?.map((website) => (
          <WebsitePopover
            key={website.id}
            website={{
              url: website.url || '',
              label: website.label || undefined
            }}
            onSave={(data) => updates.updateWebsite(website.id, data)}
            onDelete={website.id ? () => updates.deleteWebsite(website.id!) : undefined}
          />
        ))}
      </div>
    </section>
  );

  // Record Details Section
  const renderRecordDetails = () => (
    <section className='space-y-3'>
      <h3 className='text-sm font-semibold text-muted-foreground'>Record Details</h3>
      <div className='space-y-1 text-xs text-muted-foreground'>
        <p>Last Updated: {new Date(person.updated_at).toLocaleDateString()}</p>
        <p>Created: {new Date(person.created_at).toLocaleDateString()}</p>
      </div>
    </section>
  );

  return (
    <div className='flex flex-col space-y-6 p-1 pt-4'>
      {renderAssociatedPeople()}
      {renderOrganizations()}
      {renderPersonCustomFields()}
      {renderGroupCustomFields()}
      {renderBasicInfo()}
      <Separator />
      {renderContactMethods()}
      <Separator />
      {renderAddresses()}
      <Separator />
      {renderWebsites()}
      <Separator />
      {/* <Separator /> */}
      {renderRecordDetails()}
    </div>
  );
}
