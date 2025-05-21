export function getDomainFromUrl(url: string) {
  return url ? new URL(url).hostname.replace(/^www\./, '') : '';
}
