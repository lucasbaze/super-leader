'use client';

import { useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';

interface AvatarUploadProps {
  name: string;
  imageUrl: string | null | undefined;
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

export function AvatarUpload({ name, imageUrl, onUpload, className }: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) {
      toast.error('File size must be less than 6MB');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    setOpen(true);
  };

  const handleSave = async () => {
    if (file) {
      await onUpload(file);
      setOpen(false);
      setFile(null);
    }
  };

  return (
    <>
      <Avatar className={className} onClick={() => fileRef.current?.click()}>
        {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handleSelect} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='space-y-4'>
          {preview && (
            <img src={preview} alt='Preview' className='mx-auto max-h-60 rounded-full object-cover' />
          )}
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
