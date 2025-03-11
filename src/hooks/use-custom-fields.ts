import { useCallback } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type EntityType = 'person' | 'group';

export function useCustomFields(entityType: EntityType, groupId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['custom-fields', entityType, groupId];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('entityType', entityType);
      if (groupId) params.append('groupId', groupId);

      const response = await fetch(`/api/custom-fields?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch custom fields');
      }
      return response.json();
    }
  });

  const createField = useMutation({
    mutationFn: async ({
      name,
      fieldType,
      options
    }: {
      name: string;
      fieldType: string;
      options?: string[];
    }) => {
      const response = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          fieldType,
          entityType,
          groupId,
          options
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create custom field');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const updateField = useMutation({
    mutationFn: async ({ id, name, options }: { id: string; name: string; options?: string[] }) => {
      const response = await fetch(`/api/custom-fields/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, options })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update custom field');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/custom-fields/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete custom field');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const reorderFields = useMutation({
    mutationFn: async (fieldIds: string[]) => {
      const response = await fetch('/api/custom-fields/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldIds })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder custom fields');
      }

      return response.json();
    },
    onMutate: async (fieldIds: string[]) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousFields = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.data) return old;

        // Create a new array with the updated order
        const reorderedFields = fieldIds
          .map((id) => old.data.find((field: any) => field.id === id))
          .filter(Boolean);

        // Update display order
        const updatedFields = reorderedFields.map((field: any, index: number) => ({
          ...field,
          displayOrder: index
        }));

        return {
          ...old,
          data: updatedFields
        };
      });

      // Return a context object with the snapshot
      return { previousFields };
    },
    onError: (err, newFieldIds, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousFields) {
        queryClient.setQueryData(queryKey, context.previousFields);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ queryKey });
    }
  });

  return {
    fields: data?.data || [],
    isLoading,
    error,
    createField,
    updateField,
    deleteField,
    reorderFields
  };
}

export function useCustomFieldValues(entityId: string, entityType: EntityType) {
  const queryClient = useQueryClient();
  const queryKey = ['custom-field-values', entityId, entityType];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(
        `/api/custom-fields/values?entityId=${entityId}&entityType=${entityType}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch custom field values');
      }
      return response.json();
    },
    enabled: !!entityId
  });

  const setValue = useMutation({
    mutationFn: async ({ customFieldId, value }: { customFieldId: string; value: any }) => {
      const response = await fetch('/api/custom-fields/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customFieldId,
          entityId,
          value
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to set custom field value');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const updateValue = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: any }) => {
      const response = await fetch(`/api/custom-fields/values/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update custom field value');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const deleteValue = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/custom-fields/values/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete custom field value');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Helper function to find a value by field ID
  const getValueByFieldId = useCallback(
    (fieldId: string) => {
      if (!data?.data?.values) return null;
      return data.data.values.find((v: any) => v.customFieldId === fieldId);
    },
    [data]
  );

  return {
    values: data?.data?.values || [],
    fields: data?.data?.fields || [],
    isLoading,
    error,
    setValue,
    updateValue,
    deleteValue,
    getValueByFieldId
  };
}
