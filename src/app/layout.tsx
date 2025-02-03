import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toast';
import { QueryProvider } from '@/providers/query-provider';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='overflow-hidden'>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={true} />
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
