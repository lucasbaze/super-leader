import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { type PersonEditFormData, personEditSchema } from '@/lib/schemas/person-edit';
import {
  updatePersonAddress,
  updatePersonContactMethod,
  updatePersonField,
  updatePersonWebsite
} from '@/services/person/update-person-details';
import { Address, ContactMethod, type Person, Website } from '@/types/database';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

// TODO: If you want to remove an address, website, or contact method, simply omit it from the array in the details object.
// TODO: Need to return back the record id from the update call to enable easier updating
// TODO: Updating the name doesn't quite work, need to fix this

export const updatePersonDetailsTool: ChatTool<
  {
    personId: string;
    details: PersonEditFormData;
  },
  { personId: string } | ToolError
> = {
  name: CHAT_TOOLS.UPDATE_PERSON_DETAILS,
  displayName: 'Update Person Details',
  description:
    "Update a person's name, title, birthday, date met, addresses, websites, and contact methods. If the person does not exist, create a new record.",
  rulesForAI: stripIndents`\
    ## updatePersonDetails Guidelines
    - Use updatePersonDetails to update a person's contact details, birthday, addresses, websites, and contact methods for a person that already exists.
    - ONLY INCLUDE INFORMATION THAT IS BEING UPDATED. DO NOT INCLUDE INFORMATION THAT IS NOT BEING UPDATED.
    - If you do not have a personId, use findPerson first. If no person is found, do not create a new person record. Instead call the createPerson tool with the information provided.
    - This tool is for updating existing people. If you're not sure if the person exists, search first, then create if not found.
    - If multiple calls are made back to back, the previous call data should not be included unless it is explicitly asked for, e.g. "To try again".
    - If we're deleting a contact method, address, or website, the record id should be included in the details object.
  `,
  // @ts-ignore
  parameters: z.object({
    personId: z.string().describe('The ID of the person to update. If not provided, a new person will be created.'),
    details: personEditSchema.describe('The details to update: person, contactMethods, addresses, websites')
  }),
  execute: async (db, { personId, details }, { userId }) => {
    console.log('Executing updatePersonDetailsTool with details', details);
    try {
      let updatedPerson: Person | null = null;
      const updatedContactMethods: ContactMethod[] = [];
      const updatedAddresses: Address[] = [];
      const updatedWebsites: Website[] = [];

      if (details.person) {
        const attributes = Object.keys(details.person);
        for (const attribute of attributes) {
          const result = await updatePersonField({
            db,
            personId,
            field: attribute as keyof typeof details.person,
            value: details.person[attribute as keyof typeof details.person]
          });
          if (result.error) throw result.error;
          updatedPerson = result.data;
        }
      }

      // Contact Methods
      for (const method of details.contactMethods || []) {
        const result = await updatePersonContactMethod({
          db,
          personId,
          methodId: method.id,
          data: method
        });
        if (result.error) throw result.error;
        if (result.data) updatedContactMethods.push(result.data);
      }

      // Addresses
      for (const address of details.addresses || []) {
        const result = await updatePersonAddress({
          db,
          personId,
          addressId: address.id,
          data: address
        });
        console.log('New Address', result);
        if (result.error) throw result.error;
        if (result.data) updatedAddresses.push(result.data);
      }

      // Websites
      for (const website of details.websites || []) {
        const result = await updatePersonWebsite({
          db,
          personId,
          websiteId: website.id,
          data: website
        });
        if (result.error) throw result.error;
        if (result.data) updatedWebsites.push(result.data);
      }

      // NOTE: We want to make sure that the values from results are returned so that the AI can see the changes in the chat history.
      return { personId, updatedPerson, updatedContactMethods, updatedAddresses, updatedWebsites };
    } catch (error) {
      return handleToolError(error, 'Update person details');
    }
  },
  onSuccessEach: false,
  onSuccess: ({ queryClient, args }) => {
    if (args?.personId) {
      queryClient.invalidateQueries({ queryKey: ['person', args.personId, 'about', { withGroups: true }] });
      queryClient.invalidateQueries({ queryKey: ['person', args.personId, 'about', { withContactMethods: true }] });
      queryClient.invalidateQueries({ queryKey: ['person', args.personId, 'about', { withAddresses: true }] });
      queryClient.invalidateQueries({ queryKey: ['person', args.personId, 'about', { withWebsites: true }] });
    }
  }
};
