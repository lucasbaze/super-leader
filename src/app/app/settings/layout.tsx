import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsNav } from '@/components/settings/settings-nav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='absolute inset-0'>
      <SettingsHeader />
      <div className='absolute inset-0 top-[48px]'>
        <div className='grid h-full grid-cols-5 overflow-hidden'>
          {/* Main Content Area */}
          <div className='col-span-1 h-full overflow-hidden'>
            <SettingsNav />
          </div>

          {/* Sidebar - Independent Scroll */}
          <div className='col-span-4 flex h-full flex-col overflow-hidden'>
            <div className='no-scrollbar flex-1 overflow-y-auto px-4 pb-4'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
