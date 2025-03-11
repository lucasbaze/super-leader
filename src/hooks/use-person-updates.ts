import { useQueryClient } from '@tanstack/react-query';

interface UsePersonUpdatesProps {
  personId: string;
}

export function usePersonUpdates({ personId }: UsePersonUpdatesProps) {
  const queryClient = useQueryClient();

  const updateField = async (field: string, value: any) => {
    const response = await fetch(`/api/person/${personId}/details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update field');
    }

    await queryClient.invalidateQueries({ queryKey: ['person', personId] });
  };

  const updateContactMethod = async (
    methodId: string | undefined,
    data: {
      type: string;
      value: string;
      label?: string;
      is_primary: boolean;
    }
  ) => {
    const response = await fetch(`/api/person/${personId}/details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactMethod: {
          id: methodId,
          ...data
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update contact method');
    }

    await queryClient.invalidateQueries({ queryKey: ['person', personId] });
  };

  const updateAddress = async (
    addressId: string | undefined,
    data: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      label?: string;
      is_primary: boolean;
    }
  ) => {
    const response = await fetch(`/api/person/${personId}/details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: {
          id: addressId,
          ...data
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update address');
    }

    await queryClient.invalidateQueries({ queryKey: ['person', personId] });
  };

  const updateWebsite = async (
    websiteId: string | undefined,
    data: {
      url: string;
      label?: string;
    }
  ) => {
    const response = await fetch(`/api/person/${personId}/details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website: {
          id: websiteId,
          ...data
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update website');
    }

    await queryClient.invalidateQueries({ queryKey: ['person', personId] });
  };

  const deleteContactMethod = async (methodId: string) => {
    const response = await fetch(`/api/person/${personId}/details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactMethod: {
          id: methodId,
          _delete: true
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete contact method');
    }

    await queryClient.invalidateQueries({ queryKey: ['person', personId] });
  };

  const deleteAddress = async (addressId: string) => {
    const response = await fetch(`/api/person/${personId}/details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: {
          id: addressId,
          _delete: true
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete address');
    }

    await queryClient.invalidateQueries({ queryKey: ['person', personId] });
  };

  const deleteWebsite = async (websiteId: string) => {
    const response = await fetch(`/api/person/${personId}/details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website: {
          id: websiteId,
          _delete: true
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete website');
    }

    await queryClient.invalidateQueries({ queryKey: ['person', personId] });
  };

  return {
    updateField,
    updateContactMethod,
    updateAddress,
    updateWebsite,
    deleteContactMethod,
    deleteAddress,
    deleteWebsite
  };
}
