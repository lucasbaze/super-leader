'use client';

import { useMediaQuery } from 'react-responsive';

import { MobileFloatingChat } from '@/components/chat/mobile/mobile-floating-chat';
import { ResizablePanels } from '@/components/layout/resizable-panels';
import { MOBILE_QUERY } from '@/lib/ui/media-queries';

interface MobileResponsiveLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function MobileResponsiveLayout({ leftPanel, rightPanel }: MobileResponsiveLayoutProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);

  if (isMobile) {
    return (
      <div className='flex flex-1 flex-col'>
        <div className='flex-1 pb-20'>{rightPanel}</div>
        <MobileFloatingChat />
      </div>
    );
  }

  // Desktop/Tablet layout: Show both panels with resizable divider
  return <ResizablePanels leftPanel={leftPanel} rightPanel={rightPanel} />;
}
