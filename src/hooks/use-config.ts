import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { BaseColor } from '@/lib/base-colors';
import { Style } from '@/lib/styles';


type Config = {
  style: Style['name'];
  theme: BaseColor['name'];
  radius: number;
};

const configAtom = atomWithStorage<Config>('config', {
  style: 'default',
  theme: 'zinc',
  radius: 0.5
});

export function useConfig() {
  return useAtom(configAtom);
}
