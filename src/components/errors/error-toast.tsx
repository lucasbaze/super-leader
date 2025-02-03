import { toast } from 'sonner';

import { TError } from '@/types/errors';
import { Nullable } from '@/types/utils';

// TODO: Check if this looks any good
export const errorToast = {
  // show: (error: Nullable<TError>) => {
  show: (error: TError) => {
    if (!error) return;

    toast.error(error.displayMessage || 'An unexpected error occurred', {
      description: error.message
    });
  }
};
