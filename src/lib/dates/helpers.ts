import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

export const dateHandler = dayjs;

export const getDaysFromNow = (days: number) => Date.now() + 1000 * 60 * 60 * 24 * days;

export const formatAsDate = (date: Dayjs, format = 'dddd, MMMM D') => date.format(format);

export const formatAsTime = (date: Dayjs, format = 'h:mm a') => date.format(format);

export const formatTimezone = (date: Dayjs) => date.offsetName('short');

// Convert Local Time to UTC Before Saving
export const convertToUTC = (date: string | Date) => {
  return dayjs(date).utc().toISOString();
};

// Convert UTC to Any Timezone
export const convertUtcToTimezone = (utcDateString: string, timeZone: string) => {
  return dayjs(utcDateString).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
};

// Get Current Time in UTC
export const getCurrentUtcTime = () => {
  return dayjs().utc().toISOString();
};

// Compare Dates Without Timezone Issues
export const isSameDayUTC = (date1: string | Date, date2: string | Date) => {
  const d1 = dayjs(date1).utc();
  const d2 = dayjs(date2).utc();
  return d1.month() === d2.month() && d1.date() === d2.date();
};

// Get User's Timezone (For Frontend)
export const getUserTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
