import { OneRing, ThreeRing, TwoRing } from '@/components/icons';

type IconMapFunction = (props?: { size?: string | number }) => React.ReactNode;

// Convert the static map to a function map that accepts size
export const IconMap: Record<string, IconMapFunction> = {
  '5': (props = {}) => <OneRing className={`size-${props.size || '2'}`} />,
  '50': (props = {}) => <TwoRing className={`size-${props.size || '2'}`} />,
  '100': (props = {}) => <ThreeRing className={`size-${props.size || '2'}`} />
};
