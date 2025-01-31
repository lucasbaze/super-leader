import { NextRequest } from 'next/server';

import { GET } from '@/app/api/person/[id]/about/route';
import { PUT } from '@/app/api/person/[id]/details/route';

import { createTestPerson, withTestTransaction } from '../utils/test-utils';

describe('Person API', () => {
  describe('GET /api/person/[id]/about', () => {
    it('should return person details with all related data', async () => {
      await withTestTransaction(async (supabase) => {
        // Create test person with all related data
        const testPerson = await createTestPerson(supabase, {
          first_name: 'John',
          last_name: 'Doe',
          bio: 'Test bio',
          contactMethods: [
            { type: 'email', value: 'john@example.com' },
            { type: 'phone', value: '123-456-7890' }
          ],
          addresses: [
            {
              type: 'home',
              street: '123 Test St',
              city: 'Test City',
              state: 'TS',
              postal_code: '12345',
              country: 'Test Country'
            }
          ],
          websites: [
            {
              url: 'https://example.com',
              type: 'personal'
            }
          ]
        });

        // Make the request
        const response = await GET(
          new Request(`http://localhost/api/person/${testPerson.id}/about`),
          { params: { id: testPerson.id } }
        );

        const data = await response.json();

        // Assertions
        expect(response.status).toBe(200);
        expect(data.person).toMatchObject({
          first_name: 'test_John',
          last_name: 'test_Doe',
          bio: 'test_Test bio'
        });
        expect(data.contactMethods).toHaveLength(2);
        expect(data.addresses).toHaveLength(1);
        expect(data.websites).toHaveLength(1);
      });
    });

    it('should return 500 for non-existent person', async () => {
      const response = await GET(new Request('http://localhost/api/person/non-existent-id/about'), {
        params: { id: 'non-existent-id' }
      });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/person/[id]/details', () => {
    it('should update person details successfully', async () => {
      await withTestTransaction(async (supabase) => {
        const testPerson = await createTestPerson(supabase, {
          first_name: 'Jane',
          last_name: 'Doe',
          bio: 'Original bio'
        });

        const updateData = {
          bio: 'Updated bio',
          contactMethods: [{ type: 'email', value: 'jane@example.com' }],
          addresses: [
            {
              type: 'work',
              street: '456 Work St',
              city: 'Work City',
              state: 'WS',
              postal_code: '67890',
              country: 'Work Country'
            }
          ],
          websites: [
            {
              url: 'https://work.example.com',
              type: 'work'
            }
          ]
        };

        const response = await PUT(
          new NextRequest(`http://localhost/api/person/${testPerson.id}/details`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
          }),
          { params: { id: testPerson.id } }
        );

        expect(response.status).toBe(200);

        // Verify the updates
        const getResponse = await GET(
          new Request(`http://localhost/api/person/${testPerson.id}/about`),
          { params: { id: testPerson.id } }
        );

        const data = await getResponse.json();
        expect(data.person.bio).toBe('test_Updated bio');
        expect(data.contactMethods).toHaveLength(1);
        expect(data.addresses).toHaveLength(1);
        expect(data.websites).toHaveLength(1);
      });
    });
  });
});
