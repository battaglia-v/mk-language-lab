'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Volume2, Play, Check, X, Loader2, Heart } from 'lucide-react';

export default function UIKitPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (process.env.NEXT_PUBLIC_ENABLE_DEV_PAGES !== 'true') {
    return <div className="p-8 text-center text-muted-foreground">Dev pages disabled</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-4 pb-24">
      <header className="space-y-2">
        <Badge variant="secondary">Dev Only</Badge>
        <h1 className="text-3xl font-bold">UI Kit</h1>
        <p className="text-muted-foreground">Component showcase for MK Language Lab</p>
      </header>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary (56px)</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Small (44px)</Button>
          <Button size="sm" variant="outline">Small Outline</Button>
          <Button size="icon"><Heart className="h-5 w-5" /></Button>
          <Button size="icon-sm" variant="outline"><Play className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
          <Button><Loader2 className="h-4 w-4 animate-spin" />Loading</Button>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Default Card</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Card content here</p></CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle>Glass Card</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">With glass effect</p></CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Inputs</h2>
        <div className="max-w-sm space-y-3">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled" disabled />
        </div>
      </section>

      {/* Progress */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Progress</h2>
        <div className="max-w-sm space-y-3">
          <Progress value={33} />
          <Progress value={66} />
          <Progress value={100} />
        </div>
      </section>

      {/* Skeletons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading States</h2>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </section>

      {/* Bottom Sheet */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bottom Sheet</h2>
        <Button onClick={() => setSheetOpen(true)}>Open Sheet</Button>
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Example Sheet">
          <div className="space-y-4">
            <p className="text-muted-foreground">Sheet content with proper safe-area padding.</p>
            <Button className="w-full" onClick={() => setSheetOpen(false)}>Close</Button>
          </div>
        </BottomSheet>
      </section>

      {/* Spacing Demo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Spacing Scale</h2>
        <div className="flex items-end gap-2">
          {[1, 2, 3, 4, 6, 8].map(n => (
            <div key={n} className="flex flex-col items-center gap-1">
              <div className="bg-primary" style={{ width: `${n * 4}px`, height: `${n * 4}px` }} />
              <span className="text-xs text-muted-foreground">{n * 4}px</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
