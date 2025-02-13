import { convertToUTC, convertUtcToTimezone, dateHandler, isSameDayUTC } from '../helpers';

describe('Date Utils', () => {
  describe('isSameDayUTC', () => {
    it('should match birthday dates across different years and times', () => {
      const birthday = '1964-02-12T00:00:00.000Z';
      const today = '2025-02-12T17:21:57.561Z';

      expect(isSameDayUTC(birthday, today)).toBe(true);
    });

    it('should match no matter where the test is run', () => {
      const birthday = dateHandler().utc().startOf('day').toISOString();
      const today = dateHandler().utc().endOf('day').toISOString();

      expect(isSameDayUTC(birthday, today)).toBe(true);
    });

    it('should match dates on the same day regardless of time', () => {
      const date1 = '2024-03-15T00:00:00.000Z';
      const date2 = '2024-03-15T23:59:59.999Z';

      expect(isSameDayUTC(date1, date2)).toBe(true);
    });

    it('should not match dates on different days', () => {
      const date1 = '2024-03-15T23:59:59.999Z';
      const date2 = '2024-03-16T00:00:00.000Z';

      expect(isSameDayUTC(date1, date2)).toBe(false);
    });

    it('should handle Date objects as well as strings', () => {
      const date1 = new Date('2024-03-15T00:00:00.000Z');
      const date2 = '2024-03-15T23:59:59.999Z';

      expect(isSameDayUTC(date1, date2)).toBe(true);
    });
  });

  describe('convertToUTC', () => {
    it('should convert local time to UTC', () => {
      const localDate = new Date('2024-03-15T12:00:00');
      const utcString = convertToUTC(localDate);

      expect(utcString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('convertUtcToTimezone', () => {
    it('should convert UTC to specified timezone', () => {
      const utcDate = '2024-03-15T12:00:00.000Z';
      const pstDate = convertUtcToTimezone(utcDate, 'America/Los_Angeles');
      console.log('convertUtcToTimezone::pstDate', pstDate);

      expect(pstDate).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });
});
