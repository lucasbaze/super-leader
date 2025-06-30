import { getFiles, ERRORS } from '../get-files';

describe('getFiles service', () => {
  it('should return validation error when userId is missing', async () => {
    // @ts-ignore - using empty object as DB client
    const result = await getFiles({ db: {} as any, userId: '' });
    expect(result.data).toBeNull();
    expect(result.error).toEqual(ERRORS.FILES.MISSING_USER_ID);
  });

  it('should fetch files', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockResolvedValue({ data: [{ id: '1' }], error: null });
    const mockFrom = jest.fn(() => ({ select: mockSelect, eq: mockEq, order: mockOrder }));

    const mockDb = { from: mockFrom } as any;
    const result = await getFiles({ db: mockDb, userId: 'user1' });

    expect(mockFrom).toHaveBeenCalledWith('files');
    expect(mockOrder).toHaveBeenCalled();
    expect(result.data).toEqual([{ id: '1' }]);
    expect(result.error).toBeNull();
  });
});
