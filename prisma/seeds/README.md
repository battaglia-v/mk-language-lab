# Gamification Seed Data

This directory contains seed data for the gamification system (quests, badges, leagues).

## Running Seeds

To seed all data (including gamification):
```bash
npm run prisma:seed
```

Or with environment variables:
```bash
DATABASE_URL='your-connection-string' npm run prisma:seed
```

## What Gets Seeded

### Quests (8 total)
- **Daily Quests** (4): Practice exercises, XP goals, translations, perfect streaks
- **Weekly Quests** (4): Long-term challenges with bigger rewards

### Badges (17 total)
- **Achievements** (10): Earned through accomplishments (streaks, XP, quests)
- **Cosmetic** (6): Purchasable with gems (🔥, ⭐, 🏆, 👑, 💎, 🚀)
- **Seasonal** (1): Limited-time event badges

### Leagues (5 tiers)
- Bronze (0-6 day streak)
- Silver (7-20 day streak) - 1.1x XP
- Gold (21-49 day streak) - 1.2x XP
- Platinum (50-99 day streak) - 1.3x XP
- Diamond (100+ day streak) - 1.5x XP

## Updating Seeds

Seeds use `upsert` operations, so running them multiple times is safe and will update existing records.

### Adding New Quests

Edit `quests.ts`:
```typescript
{
  id: 'daily-new-quest',
  type: 'daily',
  title: 'Quest Name',
  description: 'What to do',
  category: 'practice',
  target: 10,
  targetUnit: 'exercises',
  xpReward: 50,
  currencyReward: 10,
  difficultyLevel: 'medium',
}
```

### Adding New Badges

Edit `badges.ts`:
```typescript
{
  id: 'badge-new',
  name: 'Badge Name',
  description: 'How to earn it',
  category: 'achievement', // or 'cosmetic' or 'seasonal'
  rarityTier: 'rare', // common | rare | epic | legendary
  unlockCondition: JSON.stringify({ type: 'streak', minDays: 10 }),
  costGems: 0, // 0 for achievements, > 0 for shop items
  isAvailableInShop: false,
}
```

### Adding New Leagues

Edit `leagues.ts`:
```typescript
{
  id: 'league-emerald',
  name: 'Emerald League',
  tier: 6,
  minStreak: 150,
  maxStreak: 199,
  xpMultiplier: 1.6,
  icon: '💚',
}
```

## Unlock Condition Formats

Badges use JSON unlock conditions:

```typescript
// Streak-based
{ type: 'streak', minDays: 7 }

// XP-based
{ type: 'xp', minTotal: 10000 }

// Quest-based
{ type: 'quests', minCompleted: 50 }

// Perfect sessions
{ type: 'perfect_sessions', minCount: 10 }

// Purchase-only (cosmetics)
{ type: 'purchase' }

// Seasonal
{ type: 'seasonal', season: 'winter-2025' }
```

## Verifying Seeds

After seeding, verify in Prisma Studio:
```bash
npx prisma studio
```

Or query directly:
```bash
DATABASE_URL='...' npx prisma db execute --stdin <<EOF
SELECT * FROM "Quest";
SELECT * FROM "Badge";
SELECT * FROM "League";
EOF
```

## Production Deployment

Seeds should be run:
1. After initial database migration
2. When adding new quests/badges/leagues
3. After schema changes affecting gamification

**Note**: Seeds are idempotent and safe to run multiple times.
