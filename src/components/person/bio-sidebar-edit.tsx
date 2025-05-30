/* Deprecated */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';

import { Plus, Trash } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PersonEditFormData, personEditSchema } from '@/lib/schemas/person-edit';

import type { BioSidebarData } from './bio-sidebar';

/* Deprecated */

/* Deprecated */

interface BioSidebarEditProps {
  data: BioSidebarData;
  onSubmit: (data: PersonEditFormData) => Promise<void>;
  onCancel: () => void;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className='mb-4 border-b pb-2 text-lg font-medium'>{children}</h3>;
}

function nullToEmpty(value: string | null | undefined): string {
  return value ?? '';
}

export function BioSidebarEdit({ data, onSubmit, onCancel }: BioSidebarEditProps) {
  const form = useForm<PersonEditFormData>({
    resolver: zodResolver(personEditSchema),
    defaultValues: {
      bio: data.person.bio || '',
      contactMethods: (data.contactMethods || []).map((method) => ({
        id: method.id,
        type: method.type as 'email' | 'phone',
        value: method.value,
        label: method.label || '',
        is_primary: method.is_primary || false
      })),
      addresses: (data.addresses || []).map((address) => ({
        id: address.id,
        street: nullToEmpty(address.street),
        city: nullToEmpty(address.city),
        state: nullToEmpty(address.state),
        postal_code: nullToEmpty(address.postal_code),
        country: nullToEmpty(address.country),
        label: nullToEmpty(address.label),
        is_primary: address.is_primary || false
      })),
      websites: (data.websites || []).map((website) => ({
        id: website.id,
        url: website.url,
        label: website.label || ''
      }))
    },
    mode: 'onChange'
  });

  console.log('Form state:', form.formState);

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact
  } = useFieldArray({
    control: form.control,
    name: 'contactMethods'
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress
  } = useFieldArray({
    control: form.control,
    name: 'addresses'
  });

  const {
    fields: websiteFields,
    append: appendWebsite,
    remove: removeWebsite
  } = useFieldArray({
    control: form.control,
    name: 'websites'
  });

  // Add direct submit handler
  const handleFormSubmit = async () => {
    console.log('Attempting direct form submission');
    const values = form.getValues();
    console.log('Current form values:', values);

    try {
      await onSubmit(values);
      console.log('Submit successful');
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  // Update the address append function
  const emptyAddress = {
    street: '',
    city: '',
    postal_code: '',
    country: '',
    state: '',
    label: '',
    is_primary: false
  };

  return (
    <Form {...form}>
      <form className='space-y-16 pb-40'>
        {/* Bio Section */}
        {/* <div>
          <SectionHeader>Bio</SectionHeader>
          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} className='min-h-[100px]' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}

        {/* Contact Methods */}
        <div className='space-y-4'>
          <SectionHeader>Contact Methods</SectionHeader>
          <div className='space-y-4'>
            {contactFields.map((field, index) => (
              <div key={field.id} className='space-y-3 rounded-md border p-3'>
                <FormField
                  control={form.control}
                  name={`contactMethods.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='email'>Email</SelectItem>
                          <SelectItem value='phone'>Phone</SelectItem>
                          <SelectItem value='telegram'>Telegram</SelectItem>
                          <SelectItem value='whatsapp'>WhatsApp</SelectItem>
                          <SelectItem value='signal'>Signal</SelectItem>
                          <SelectItem value='other'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`contactMethods.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>Value</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className='flex items-center justify-between'>
                  <FormField
                    control={form.control}
                    name={`contactMethods.${index}.is_primary`}
                    render={({ field }) => (
                      <FormItem className='flex items-center space-x-2'>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className='text-sm'>Primary Contact</FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button type='button' variant='ghost' size='sm' onClick={() => removeContact(index)}>
                    <Trash className='size-4 stroke-red-600' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-4'
            onClick={() => appendContact({ type: 'email', value: '', is_primary: false })}>
            <Plus className='mr-2 size-4' />
            Add Contact
          </Button>
        </div>

        {/* Addresses */}
        <div className='space-y-4'>
          <SectionHeader>Addresses</SectionHeader>
          <div className='space-y-4'>
            {addressFields.map((field, index) => (
              <div key={field.id} className='space-y-2 rounded-md border p-2'>
                <FormField
                  control={form.control}
                  name={`addresses.${index}.street`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>Street</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addresses.${index}.city`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addresses.${index}.state`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addresses.${index}.postal_code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addresses.${index}.country`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className='flex items-center justify-between'>
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.is_primary`}
                    render={({ field }) => (
                      <FormItem className='flex items-center space-x-2'>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className='text-sm'>Primary Address</FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button type='button' variant='ghost' size='sm' onClick={() => removeAddress(index)}>
                    <Trash className='size-4 stroke-red-600' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-4'
            onClick={() => appendAddress(emptyAddress)}>
            <Plus className='mr-2 size-4' />
            Add Address
          </Button>
        </div>

        {/* Websites */}
        <div className='space-y-4'>
          <SectionHeader>Websites & Social</SectionHeader>
          <div className='space-y-4'>
            {websiteFields.map((field, index) => (
              <div key={field.id} className='space-y-3 rounded-md border p-4'>
                <FormField
                  control={form.control}
                  name={`websites.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='https://' />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`websites.${index}.label`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>Label</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Label (optional)' />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className='flex justify-end'>
                  <Button type='button' variant='ghost' size='sm' onClick={() => removeWebsite(index)}>
                    <Trash className='size-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-4'
            onClick={() => appendWebsite({ url: '', label: '' })}>
            <Plus className='mr-2 size-4' />
            Add Website
          </Button>
        </div>

        <div className='absolute bottom-0 right-1 flex w-full justify-end gap-2 border-t bg-background p-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='button' disabled={form.formState.isSubmitting} onClick={handleFormSubmit}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
