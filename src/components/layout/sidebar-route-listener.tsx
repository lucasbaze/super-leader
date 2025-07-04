'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useSidebar } from '@/components/ui/sidebar';

export function SidebarRouteListener() {
  const { openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (openMobile) {
        setOpenMobile(false);
      }
    }
  }, [pathname, openMobile, setOpenMobile]);

  return null;
}
