'use client';

import React from 'react';

import { Upload } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

interface ImportCSVButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ImportCSVButton({ variant = 'outline', size = 'sm', className }: ImportCSVButtonProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData
      });
      const json = await response.json();

      if (json.error) {
        toast.error(json.error.message);
      } else {
        toast.success(`CSV ${file.name} imported successfully. Processing in the background...`);
      }
    } catch (error) {
      toast.error('Failed to upload file');
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => fileInputRef.current?.click()}>
        <Upload className='mr-2 size-4' />
        Import CSV
      </Button>
      <input ref={fileInputRef} type='file' accept='.csv' onChange={handleFileChange} className='hidden' />
    </>
  );
}
