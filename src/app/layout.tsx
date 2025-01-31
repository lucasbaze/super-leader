import { ThemeProvider } from '@/components/theme/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='overflow-hidden'>
        <ThemeProvider>
          <QueryProvider>
            {children}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
