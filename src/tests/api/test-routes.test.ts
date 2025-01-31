/**
 * @jest-environment node
 */
import { GET } from '@/app/api/test/route';

it('should return data with status 200', async () => {
  const response = await GET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.length).toBe(2);
});
