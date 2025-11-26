import { SessionProvider } from '@/components/auth/SessionProvider';
import { ToasterProvider } from '@/components/ui/toast';
import type { ReactNode } from 'react';

export default function AdminSigninLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <ToasterProvider>{children}</ToasterProvider>
    </SessionProvider>
  );
}
