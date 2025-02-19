'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Loader, Search, X } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSimpleSearchPeople } from '@/hooks/use-simple-search-people';
import { useRecentlyViewedStore } from '@/stores/use-recently-viewed-store';

import { SearchSectionHeader } from './search-section-header';
import { SimpleSearchListItem } from './simple-search-list-item';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { searchTerm, setSearchTerm, people, isFetching } = useSimpleSearchPeople();
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

  const handleSelectPerson = (personId: string) => {
    handleOpenChange(false);
    router.push(`/app/person/${personId}`);
  };

  return (
    <div className='relative w-full rounded-md border bg-background md:max-w-sm'>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div className='relative'>
            {isFetching ? (
              <Loader className='absolute left-2 top-2.5 size-4 animate-spin text-muted-foreground' />
            ) : (
              <Search className='absolute left-2 top-2.5 size-4 text-muted-foreground' />
            )}
            <Input
              ref={inputRef}
              className='rounded-md border-none bg-background pl-8 shadow-none'
              type='text'
              placeholder='Quick search...'
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
            className='max-h-[360px] overflow-auto'
            role='listbox'
            tabIndex={-1}>
            {people.length === 0 ? (
              <div className='flex items-center justify-center py-6 text-sm text-muted-foreground'>
                No people found
              </div>
            ) : (
              <div className='py-2'>
                {recentlyViewed.length > 0 && (
                  <>
                    <SearchSectionHeader label='Recently Viewed' onClear={clearRecentlyViewed} />
                    {recentlyViewed.map((person, index) => (
                      <SimpleSearchListItem
                        key={person.id}
                        person={person}
                        index={index}
                        activeIndex={activeIndex}
                        onSelect={handleSelectPerson}
                      />
                    ))}
                  </>
                )}
                <SearchSectionHeader
                  label={!isFetching && searchTerm ? 'Results' : 'Recently Added'}
                />
                {people.map((person, index) => (
                  <SimpleSearchListItem
                    key={person.id}
                    person={person}
                    index={index}
                    activeIndex={activeIndex}
                    onSelect={handleSelectPerson}
                  />
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
