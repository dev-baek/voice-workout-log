'use client';

import { TDSMobileProvider } from '@toss/tds-mobile';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

import { EmotionRegistry } from './emotion-registry';

const fallbackUserAgent = {
  fontA11y: undefined,
  fontScale: 100,
  isAndroid: false,
  isIOS: false,
  colorPreference: 'light' as const,
};

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  const isTossApp = useSyncExternalStore(
    subscribeToStableUserAgent,
    getClientIsTossApp,
    getServerIsTossApp,
  );

  return (
    <EmotionRegistry>
      {isTossApp ? (
        <TDSMobileAITProvider>{children}</TDSMobileAITProvider>
      ) : (
        <TDSMobileProvider userAgent={fallbackUserAgent}>{children}</TDSMobileProvider>
      )}
    </EmotionRegistry>
  );
}

function subscribeToStableUserAgent() {
  return () => {};
}

function getClientIsTossApp() {
  return /TossApp\//.test(window.navigator.userAgent);
}

function getServerIsTossApp() {
  return false;
}
