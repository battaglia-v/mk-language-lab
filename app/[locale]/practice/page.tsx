'use client';

import { PageContainer } from '@/components/layout';
import { PracticeHub } from '@/components/practice/PracticeHub';

export default function PracticePage() {
  return (
    <PageContainer size="lg" className="pb-24 sm:pb-6">
      <PracticeHub />
    </PageContainer>
  );
}
