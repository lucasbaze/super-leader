import { dateHandler } from './helpers';

/**
 * Gets the user's local timezone
 * @returns The IANA timezone name for the user's local timezone
 */
export function getUserTimezone(): string {
  try {
    return dateHandler.tz.guess();
  } catch (e) {
    return 'UTC';
  }
}
