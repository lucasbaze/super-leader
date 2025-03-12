'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

const SETTINGS_SECTIONS = [
  {
    title: 'Custom Fields',
    href: routes.settings.customFields()
  }
  // Add more sections here as needed
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className='w-fulloverflow-y-auto h-full border-r'>
      <nav className='flex h-full flex-col py-2'>
        {SETTINGS_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              'px-4 py-2 text-left text-sm transition-colors',
              'flex items-center hover:bg-muted',
              pathname === section.href
                ? 'bg-muted/50 font-medium text-foreground'
                : 'text-muted-foreground'
            )}>
            <span>{section.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
