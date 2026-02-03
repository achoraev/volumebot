"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const SolanaProvider = dynamic<{ children: ReactNode }>(
  () => import('@/components/SolanaProvider').then((mod) => mod.SolanaProvider),
  { ssr: false }
);

export function ClientProviders({ children }: { children: ReactNode }) {
  return <SolanaProvider>{children}</SolanaProvider>;
}