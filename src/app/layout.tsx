import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Superleader',
  description: 'Your strategic relationship manager',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/mobile-icon.png',
    apple: '/images/mobile-icon.png'
  },
  themeColor: '#ffffff'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}
        style={{ backgroundColor: '#EEEEEE' }}>
        <AuthProvider>
          <ThemeProvider>
            <QueryProvider>
              {children}
              <ReactQueryDevtools initialIsOpen={true} />
            </QueryProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
