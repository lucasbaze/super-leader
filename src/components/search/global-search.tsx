'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Loader, Search, X } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSimpleSearchPeople } from '@/hooks/use-simple-search-people';
import { cn } from '@/lib/utils';
import { useRecentlyViewedStore } from '@/stores/use-recently-viewed-store';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { searchTerm, setSearchTerm, people, isLoading } = useSimpleSearchPeople();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewedStore();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setInputValue('');
      setActiveIndex(-1);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || people.length === 0) return;

    // Handle arrow keys and tab
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < people.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Tab':
        if (!e.shiftKey) {
          e.preventDefault();
          setActiveIndex((prev) => (prev < people.length - 1 ? prev + 1 : 0));
        } else {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : people.length - 1));
        }
        break;
      case 'Enter':
        if (activeIndex >= 0) {
          e.preventDefault();
          const selectedPerson = people[activeIndex];
          handleOpenChange(false);
          router.push(`/app/person/${selectedPerson.id}`);
        }
        break;
      case 'Escape':
        handleOpenChange(false);
        inputRef.current?.focus();
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const activeElement = resultsRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className='relative w-full md:max-w-sm'>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div className='relative'>
            {isLoading ? (
              <Loader className='absolute left-2 top-2.5 size-4 animate-spin text-muted-foreground' />
            ) : (
              <Search className='absolute left-2 top-2.5 size-4 text-muted-foreground' />
            )}
            <Input
              ref={inputRef}
              className='rounded-full border bg-background pl-8'
              type='text'
              placeholder='Search people...'
              value={inputValue}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] p-0'
          align='start'
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}>
          <div
            ref={resultsRef}
            className='max-h-[280px] overflow-auto'
            role='listbox'
            tabIndex={-1}>
            {people.length === 0 ? (
              <div className='flex items-center justify-center py-6 text-sm text-muted-foreground'>
                No people found
              </div>
            ) : (
              <div className='py-2'>
                {!searchTerm && recentlyViewed.length > 0 && (
                  <>
                    <div className='flex items-center justify-between px-4 py-1'>
                      <span className='text-xs text-muted-foreground'>Recently Viewed</span>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 px-2'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearRecentlyViewed();
                        }}>
                        <X className='size-3' />
                      </Button>
                    </div>
                    {recentlyViewed.map((person, index) => (
                      <button
                        key={person.id}
                        role='option'
                        aria-selected={activeIndex === index}
                        className={cn(
                          'flex w-full items-center gap-2 px-4 py-2 text-left text-sm',
                          'hover:bg-muted',
                          activeIndex === index && 'bg-muted'
                        )}
                        onClick={() => {
                          handleOpenChange(false);
                          router.push(`/app/person/${person.id}`);
                        }}>
                        <Avatar className='size-8 shrink-0'>
                          <AvatarImage
                            src={undefined}
                            alt={`${person.first_name} ${person.last_name}`}
                          />
                          <AvatarFallback>{person.first_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {person.first_name} {person.last_name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
                <div className='flex items-center justify-between px-4 py-1'>
                  <span className='text-xs text-muted-foreground'>
                    {searchTerm ? 'Results' : 'Recently Added'}
                  </span>
                </div>
                {people.map((person, index) => (
                  <button
                    key={person.id}
                    role='option'
                    aria-selected={activeIndex === index}
                    className={cn(
                      'flex w-full items-center gap-2 px-4 py-2 text-left text-sm',
                      'hover:bg-muted',
                      activeIndex === index && 'bg-muted'
                    )}
                    onClick={() => {
                      handleOpenChange(false);
                      router.push(`/app/person/${person.id}`);
                    }}>
                    <Avatar className='size-8 shrink-0'>
                      <AvatarImage
                        src={undefined}
                        alt={`${person.first_name} ${person.last_name}`}
                      />
                      <AvatarFallback>{person.first_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <span className='font-medium'>
                        {person.first_name} {person.last_name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
