import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { useMounted } from '@/hooks/utils/use-mounted';
import { ColorFormat } from '@/lib/colors';

type Config = {
  format: ColorFormat;
};

const colorsAtom = atomWithStorage<Config>('colors', {
  format: 'hsl'
});

export function useColors() {
  const [colors, setColors] = useAtom(colorsAtom);
  const mounted = useMounted();

  return {
    isLoading: !mounted,
    format: colors.format,
    setFormat: (format: ColorFormat) => setColors({ format })
  };
}
