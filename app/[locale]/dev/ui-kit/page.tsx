'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Play, Heart, Check, Copy, Volume2, ChevronRight } from 'lucide-react';

export default function UIKitPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [segment, setSegment] = useState('text');
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  if (process.env.NEXT_PUBLIC_ENABLE_DEV_PAGES !== 'true') {
    return <div className="p-8 text-center text-muted-foreground">Dev pages disabled</div>;
  }

  return (
    <div className="mx-auto w-full max-w-[430px] space-y-8 px-4 pb-24">
      <header className="space-y-2 pt-4">
        <Badge variant="secondary">Mobile-First UI Kit</Badge>
        <h1 className="text-2xl font-bold">Component Reference</h1>
        <p className="text-sm text-muted-foreground">375px mobile viewport • ChatGPT minimal + Duolingo playful</p>
      </header>

      {/* Primary CTA Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Primary CTA (Full Width)</h2>
        <div className="space-y-3">
          <PrimaryButton>Start today&apos;s lesson</PrimaryButton>
          <PrimaryButton variant="success"><Check className="h-5 w-5" /> Correct!</PrimaryButton>
          <PrimaryButton variant="outline">Quick practice</PrimaryButton>
          <PrimaryButton loading={loading} onClick={handleLoadingDemo}>
            {loading ? 'Loading...' : 'Test loading'}
          </PrimaryButton>
          <PrimaryButton disabled>Disabled state</PrimaryButton>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Button Variants</h2>
        <div className="space-y-3">
          <Button className="w-full">Primary (56px)</Button>
          <Button variant="secondary" className="w-full">Secondary</Button>
          <Button variant="outline" className="w-full">Outline</Button>
          <Button variant="ghost" className="w-full">Ghost</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="icon"><Heart className="h-5 w-5" /></Button>
          <Button size="icon-sm" variant="outline"><Play className="h-4 w-4" /></Button>
          <Button size="icon-sm" variant="ghost"><Copy className="h-4 w-4" /></Button>
          <Button size="icon-sm" variant="ghost"><Volume2 className="h-4 w-4" /></Button>
        </div>
      </section>

      {/* Text Buttons with Clear Labels */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Text Buttons (Clear Labels)</h2>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Copy className="h-4 w-4" /> Copy text
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Volume2 className="h-4 w-4" /> Listen
          </Button>
          <Button variant="link" className="w-full justify-start">
            View all lessons <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Segmented Control */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Segmented Control</h2>
        <SegmentedControl
          options={[
            { value: 'text', label: 'Text' },
            { value: 'grammar', label: 'Grammar' },
            { value: 'vocab', label: 'Vocabulary' },
          ]}
          value={segment}
          onChange={setSegment}
        />
        <p className="text-sm text-muted-foreground">Selected: {segment}</p>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Cards</h2>
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Basic Card</span>
              <Badge>A1</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Card with badge and content.</p>
          </Card>
          <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]">
            <div className="flex items-center justify-between">
              <span className="font-medium">Tappable Card</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
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
        <h2 className="text-lg font-semibold">Bottom Sheet (Word Details)</h2>
        <Button onClick={() => setSheetOpen(true)} className="w-full">Open Word Sheet</Button>
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Word Details" description="Tap to save or practice">
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-2xl font-bold mb-1">zdravo</p>
              <p className="text-muted-foreground">hello</p>
              <Badge variant="secondary" className="mt-2">interjection</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                <Volume2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Listen</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                <Heart className="h-5 w-5 mb-1" />
                <span className="text-xs">Save word</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                <Play className="h-5 w-5 mb-1" />
                <span className="text-xs">Practice</span>
              </Button>
            </div>
            <PrimaryButton onClick={() => setSheetOpen(false)}>Got it</PrimaryButton>
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
