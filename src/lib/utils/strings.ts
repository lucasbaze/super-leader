export const wrapTicks = (str: string, label?: string) => {
  return `${'```'}${label ?? ''}\n${str}\n${'```'}`;
};
