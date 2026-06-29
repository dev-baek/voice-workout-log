'use client';

import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import type { ReactNode } from 'react';

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return <TDSMobileAITProvider>{children}</TDSMobileAITProvider>;
}
