#!/usr/bin/env tsx
/**
 * Practice Audio Sync Script
 *
 * Reads data/practice-audio.json and syncs it to the PracticeAudio table.
 * Upserts matching records and prunes stale IDs not found in fixtures.
 *
 * Usage:
 *   npm run practice-audio:sync
 *   npm run practice-audio:sync -- --dry-run
 */

import { PrismaClient, PracticeAudioSource, PracticeAudioStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

type AudioFixture = {
  id: string;
  promptId: string;
  language?: string;
  speaker?: string;
  speed?: string;
  variant?: string;
  duration?: number;
  sourceType: 'human' | 'tts';
  cdnUrl: string;
  slowUrl?: string | null;
  waveform?: number[];
};

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  if (isDryRun) {
    console.log('🏃 Running in DRY RUN mode - no changes will be made\n');
  }

  // Read fixtures
  const fixturesPath = path.join(process.cwd(), 'data', 'practice-audio.json');

  if (!fs.existsSync(fixturesPath)) {
    console.error(\`❌ Error: practice-audio.json not found at \${fixturesPath}\`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(fixturesPath, 'utf-8');
  const fixtures: AudioFixture[] = JSON.parse(rawData);

  console.log(\`📖 Loaded \${fixtures.length} audio fixtures from practice-audio.json\n\`);

  // Upsert each fixture
  let upsertedCount = 0;
  let skippedCount = 0;

  for (const fixture of fixtures) {
    try {
      const sourceType: PracticeAudioSource =
        fixture.sourceType === 'human' ? PracticeAudioSource.human : PracticeAudioSource.tts;

      if (isDryRun) {
        console.log(\`  [DRY RUN] Would upsert: promptId=\${fixture.promptId}, sourceType=\${sourceType}\`);
        upsertedCount++;
      } else {
        await prisma.practiceAudio.upsert({
          where: { promptId: fixture.promptId },
          update: {
            language: fixture.language || 'mk',
            speaker: fixture.speaker || null,
            speed: fixture.speed || 'normal',
            variant: fixture.variant || null,
            duration: fixture.duration || null,
            status: PracticeAudioStatus.published,
            sourceType,
            cdnUrl: fixture.cdnUrl,
            slowUrl: fixture.slowUrl || null,
            waveform: fixture.waveform ? JSON.parse(JSON.stringify(fixture.waveform)) : null,
            publishedAt: new Date(),
            updatedAt: new Date(),
          },
          create: {
            promptId: fixture.promptId,
            language: fixture.language || 'mk',
            speaker: fixture.speaker || null,
            speed: fixture.speed || 'normal',
            variant: fixture.variant || null,
            duration: fixture.duration || null,
            status: PracticeAudioStatus.published,
            sourceType,
            cdnUrl: fixture.cdnUrl,
            slowUrl: fixture.slowUrl || null,
            waveform: fixture.waveform ? JSON.parse(JSON.stringify(fixture.waveform)) : null,
            publishedAt: new Date(),
          },
        });

        upsertedCount++;
        console.log(\`  ✅ Upserted: promptId=\${fixture.promptId}, sourceType=\${sourceType}\`);
      }
    } catch (error) {
      console.error(\`  ❌ Failed to upsert promptId=\${fixture.promptId}:\`, error);
      skippedCount++;
    }
  }

  console.log(\`\n✨ Upserted \${upsertedCount} records\`);
  if (skippedCount > 0) {
    console.log(\`⚠️  Skipped \${skippedCount} records due to errors\`);
  }

  // Prune stale records
  if (!isDryRun) {
    const fixturePromptIds = fixtures.map((f) => f.promptId);

    const staleRecords = await prisma.practiceAudio.findMany({
      where: {
        promptId: {
          notIn: fixturePromptIds,
        },
      },
      select: {
        id: true,
        promptId: true,
      },
    });

    if (staleRecords.length > 0) {
      console.log(\`\n🗑️  Found \${staleRecords.length} stale records not in fixtures:\`);
      staleRecords.forEach((record) => {
        console.log(\`    - promptId: \${record.promptId}\`);
      });

      const deleteResult = await prisma.practiceAudio.deleteMany({
        where: {
          promptId: {
            notIn: fixturePromptIds,
          },
        },
      });

      console.log(\`\n✅ Deleted \${deleteResult.count} stale records\`);
    } else {
      console.log('\n✨ No stale records found - database is in sync with fixtures');
    }
  } else {
    console.log('\n[DRY RUN] Skipping stale record cleanup');
  }

  console.log('\n🎉 Sync complete!\n');
}

main()
  .catch((error) => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
