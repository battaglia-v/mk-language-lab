"use client";

import { type ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallbackHeight?: string;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}
