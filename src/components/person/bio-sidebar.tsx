import { useParams } from 'next/navigation';

import { AddressPopover } from '@/components/editable/address-popover';
import { ContactMethodPopover } from '@/components/editable/contact-method-popover';
import { EditableDate } from '@/components/editable/editable-date';
import { EditableField } from '@/components/editable/editable-field';
import { WebsitePopover } from '@/components/editable/website-popover';
import { Plus } from '@/components/icons';
import { CustomFieldsSection } from '@/components/person/custom-fields-section';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePersonUpdates } from '@/hooks/use-person-updates';
import { PersonGroup } from '@/types/custom';
import type { Address, ContactMethod, Person, Website } from '@/types/database';

export interface BioSidebarData {
  person: Person;
  contactMethods?: ContactMethod[];
  addresses?: Address[];
  websites?: Website[];
  groups?: PersonGroup[];
}

export interface PersonBioSidebarProps {
  data: BioSidebarData | undefined;
}

export function PersonBioSidebar({ data }: PersonBioSidebarProps) {
  if (!data) return null;
  const params = useParams();
  const personId = params.id as string;
  const updates = usePersonUpdates({ personId });

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
        {data.contactMethods?.map((method) => (
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
        {data.addresses?.map((address) => (
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
        {data.websites?.map((website) => (
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

  // Basic Information Section
  const renderBasicInfo = () => (
    <section className='space-y-3'>
      <h3 className='text-sm font-semibold text-muted-foreground'>Basic Information</h3>
      <div className='space-y-2'>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>Birthday</label>
          <EditableDate
            value={data.person.birthday}
            onChange={(value) => updates.updateField('birthday', value)}
            placeholder='Select birthday'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>Date Met</label>
          <EditableDate
            value={data.person.date_met}
            onChange={(value) => updates.updateField('date_met', value)}
            placeholder='Select date met'
          />
        </div>
      </div>
    </section>
  );

  const renderPersonCustomFields = () => {
    return <CustomFieldsSection personId={personId} sectionType='person' />;
  };

  const renderGroupCustomFields = () => {
    return data.groups?.map((group) => (
      <CustomFieldsSection
        key={group.id}
        personId={personId}
        groupId={group.id}
        sectionType='group'
        groupName={group.name}
      />
    ));
  };

  // Record Details Section
  const renderRecordDetails = () => (
    <section className='space-y-3'>
      <h3 className='text-sm font-semibold text-muted-foreground'>Record Details</h3>
      <div className='space-y-1 text-xs text-muted-foreground'>
        <p>Last Updated: {new Date(data.person.updated_at).toLocaleDateString()}</p>
        <p>Created: {new Date(data.person.created_at).toLocaleDateString()}</p>
      </div>
    </section>
  );

  return (
    <div className='flex flex-col space-y-6 p-1 pt-4'>
      {renderBasicInfo()}
      <Separator />
      {renderContactMethods()}
      <Separator />
      {renderAddresses()}
      <Separator />
      {renderWebsites()}
      <Separator />
      {renderPersonCustomFields()}
      <Separator />
      {renderGroupCustomFields()}
      {/* <Separator /> */}
      {renderRecordDetails()}
    </div>
  );
}
