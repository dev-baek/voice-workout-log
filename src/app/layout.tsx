import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { AppProviders } from './providers/app-providers';
import './globals.css';

export const metadata: Metadata = {
  title: '말하는 운동기록',
  description: 'Voice Workout Log WebView mini app',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
