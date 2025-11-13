# 2025 Mobile UI & Feature Experience Plan

Prepared to align Македонски • MK Language Lab with top-tier mobile learning apps (Duolingo, Clozemaster, Memrise, Elevate, Headspace, Habitica) while staying true to the Macedonian brand system.

## 1. Objectives
- Deliver a cohesive mobile-first system that reduces friction across onboarding, lessons, translator, tutor, and discovery surfaces.
- Bake in meaningful gamification loops (missions → XP → streaks/leagues → social proof) to drive >30% lift in day-7 retention.
- Support rich media practice, starting with Clozemaster-style audio read-outs inside Quick Practice, managed entirely from the admin panel.
- Standardize the visual language (color, typography, iconography, motion) so every screen feels like the same product family.

## 2. Competitive Reference Patterns
| App | Notable Mechanic | Adoption Plan |
| --- | --- | --- |
| Duolingo | Daily mission loop (streak, XP chest, leagues) | Mirror the “daily mission” hero on Home with streak + XP progress + 1-tap resume. |
| Clozemaster | Rapid-fire Cloze drills with audio + keyboard focus | Rebuild Quick Practice as swipeable cards with inline audio controls and keyboard-first focus states. |
| Memrise | Native-quality video/audio snippets | Allow professors to upload human audio, auto-transcode, and surface as mandatory listening tasks. |
| Headspace | Calm dashboard + coach tips carousel | Introduce guided “Coach Tips” cards below the mission hero for contextual nudges. |
| Habitica | Quest-based social accountability | Add time-bound quests (solo or squad) with rewards and lightweight squad chat. |
| Elevate | Skill maps + streak risk notifications | Create a modular stats screen with heat maps, weak-skill alerts, and smart reminders. |

## 3. Experience Pillars
1. **Mission-First Flow:** Every session starts with a clear goal (XP target, lesson count, quest) and celebrates completion.
2. **Micro-Interactions Everywhere:** Soft haptics, confetti bursts, animated progress bars, and delight states inspired by Duolingo/Elevate.
3. **Contextual Personalization:** Surface Smart Review prompts, weak vocab categories, and recommended content using learner history.
4. **Seamless Mobility:** All core actions reachable within thumb zone; no modal requires scrolling; offline-friendly patterns for cached lessons/audio.

## 4. Navigation & Layout System
- **Global shell:** Bottom tab bar (Home, Practice, Discover, Profile) plus floating “Continue” pill that resumes the next mission item; top app bar reserved for locale switch + inbox.
- **Design tokens:** Extend `docs/design/tokens.md` with semantic roles (surface, brand, feedback) and introduce typography scale (`Display`, `Title`, `Body`, `Caption`) to enforce consistency.
- **Component library:** Build shared primitives in `components/ui/` (Card, ProgressRing, StatPill, AudioButton, SwipeableStack) and document in Storybook for faster iteration.
- **Adaptive spacing:** Define layout grid (4/8 spacing, 12-col) with mobile-specific variants (XS cards, collapsed headers) so we avoid ad-hoc padding tweaks.

## 5. Module-Specific Enhancements

### 5.1 Onboarding & Personalization
- Replace static welcome with a 3-step wizard (Goal, Level test, Daily schedule). Borrow Duolingo’s mascot energy via illustrated coach character.
- Immediately create a “Daily Mission” object (target XP, streak reminders) and clarify rewards before entering Home.

### 5.2 Home Dashboard
1. **Hero card:** Shows streak flame, XP-to-level meter, and CTA `Continue mission`. Long press reveals mission checklist.
2. **Coach tips carousel:** Headspace-style cards that rotate between cultural notes, study hacks, and new audio packs.
3. **Smart Review rail:** Horizontal chips for weak vocab clusters; tapping launches Quick Practice filtered to that cluster.
4. **Community row:** Highlights friend progress, squad quests, and leaderboard placement to keep social pressure visible.

### 5.3 Quick Practice 2.0
- Convert current modal into a full-height sheet with swipeable cards (Cloze, Multiple Choice, Listening, Typing). Keep each screen under 320px vertical allotment.
- Include contextual progress HUD (items solved, accuracy, XP) pinned to top; bottom area reserved for primary CTA + audio transport.
- Add **Session Talismans** (earned at 100% accuracy or >10 streak) that convert into XP boosters or currency for the badge shop.
- Offer difficulty selector (Casual, Focus, Blitz) influencing timers, XP multipliers, and the number of hearts consumed on mistakes.
- Integrate the new audio pipeline (Section 7) so Cloze/listening cards auto-play and expose “slow replay” + waveform progress.

### 5.4 AI Tutor (Conversations)
- Redesign chat bubbles with colored headers for system hints, inline grammar callouts, and quick-reply chips.
- Add “Goal context” banner so users remember what skill they are training; show XP gain + hearts consumed at session end.
- Support micro-quests (“Use the dative case twice”) to bridge tutor practice with mission objectives.

### 5.5 Translation Lab
- Flip default direction to EN→MK, add segmented control for direction, and keep inputs within a sticky 65vh card.
- Introduce **Saved Phrases** drawer and “Practice this set” CTA that launches Quick Practice with the selected phrases.
- Provide audio playback for results when audio assets exist (re-using the same clip schema as Quick Practice).

### 5.6 Discover (Daily Lessons + News)
- Transform Instagram + news feeds into a unified “Discover” stream with filters (Culture, Grammar, Breaking news).
- Use large editorial cards with background imagery, overlay gradient, and pinned actions (“Add to Study Deck”, “Listen”).
- Surface “Upcoming events” mini-calendar (study group, live AMA) to mimic community-driven engagement seen in Memrise/Headspace.

### 5.7 Profile & Stats
- Build a **Skill Tree / Map** similar to Duolingo but tuned to Macedonian curriculum topics (Greetings, Family, Travel).
- Add retrospective charts: XP per week, accuracy heat map, audio practice minutes, quest completion.
- Introduce shareable achievement cards (PNG export) with localized taglines for social virality.

### 5.8 Notifications & Inbox
- Create in-app inbox for streak warnings, quest invites, instructor announcements, and new audio packs.
- Pair with push/email scheduling logic that uses quiet hours + user preference tiers.

### 5.9 Admin Console
- Consolidate content, vocab, and audio management into a single dashboard with data health indicators (missing audio, stale lessons).
- Provide release gating: editors can submit changes to staging decks, admins approve/publish to production.

## 6. Gamification & Retention Systems
1. **XP + Hearts Refresh:** Hearts regenerate on timers; XP multipliers granted by talismans or quests.
2. **Streak & League tiers:** Weekly leagues (Bronze → Diamond) with promotion/demotion thresholds; show opponent avatars on Home.
3. **Quests:** Daily (solo) and Weekly (squad). Each quest ties to actual learning tasks (complete 3 listening drills). Rewards: XP, cosmetics, currency.
4. **Badge shop:** Cosmetic flair (profile frames, map skins) purchasable with currency earned from quests/talismans.
5. **Reminder intelligence:** Notifications triggered by streak risk, idle squads, or new audio packs relevant to the user’s weak skills.

## 7. Quick Practice Audio Read-Outs

### 7.1 Data & Storage
- **Prisma schema additions:** `practiceAudio` table (id, promptId, language, speaker, speed, variant, duration, status, sourceType, cdnUrl, waveformKey, createdAt, publishedAt).
- **Storage strategy:** Upload raw WAV/MP3 to `s3://media.practice-audio/raw/`; background worker normalizes loudness (LUFS), trims silence, transcodes to AAC/OGG, and writes optimized files to `.../processed/`.
- **CDN delivery:** Serve via CloudFront/Vercel Blob with signed URLs cached client-side; include checksum to detect stale downloads.

### 7.2 Admin Workflow
1. **Audio Library page (new route `app/admin/practice-audio`):**
   - Drag-and-drop upload (single or bulk zip) with progress, loudness meter, and waveform preview.
   - Metadata form: language, dialect, speaker label, playback speed, prompt mapping (auto-complete from practice vocabulary), transcript, optional notes for TTS fallback.
   - Validation: duration limits (1–8s), sample rate ≥44.1 kHz, no clipping > -1 dBFS.
2. **Processing queue:** Upload triggers a background job (e.g., queue via Upstash/Redis). Worker performs normalization, transcription confidence check, and stores final URLs plus waveform peaks JSON for UI scrubbing.
3. **Assignment:** Content creators can attach audio to multiple prompt variants (e.g., slow vs normal). Admins review and publish.
4. **Versioning:** Keep history so older audio can be restored; maintain status badges (Draft, Processing, Needs Review, Published).

### 7.3 App Integration
- Extend Quick Practice payload to include `audioClip` object (url, slowUrl, waveform, duration, autoplay flag).
- UI shows transport controls (Play/Pause, Slow 0.75x, Replay) plus visual waveform slider; autoplay when entering listening/Cloze cards with a short countdown.
- Prefetch the next card’s clip after current playback starts to ensure no latency.
- Analytics: log `audio_playback`, `audio_slow_replay`, and `audio_missing_fallback` events for QA.
- **Fallbacks:** If no human clip exists, server generates TTS via Google Cloud or ElevenLabs, tags `sourceType='tts'`, and queues for human replacement.

## 8. Delivery Roadmap
| Phase | Timeline | Focus | Outputs |
| --- | --- | --- | --- |
| 0. Foundations | Weeks 1–2 | Design system tokens, Storybook setup, navigation shell scaffolding | Token doc, component library baseline |
| 1. Mission Loop | Weeks 3–6 | Onboarding, Home hero, streak/XP systems, notifications MVP | New Home, mission service, reminder cron |
| 2. Practice Revamp | Weeks 5–10 | Quick Practice 2.0, audio pipeline MVP, Smart Review rail | Swipeable widget, audio admin tooling, telemetry |
| 3. Tutor & Translator | Weeks 8–12 | Conversation redesign, translator overhaul, shared audio player | Updated tutor UI, translator cards, shared audio hook |
| 4. Discover & Social | Weeks 10–14 | Discover feed, quests, squads, shareables | Discover page, squad infra, badge assets |
| 5. Polish & QA | Weeks 12–16 | Motion, accessibility, localization, beta rounds | Lottie animations, a11y audit, beta feedback fixes |

Parallel track: content/audio creation. Professors can start uploading clips as soon as Phase 2 admin tooling ships; app surfaces clips progressively.

## 9. Success Metrics
- **Engagement:** +30% increase in Daily Active Learners, +25% lift in Quick Practice sessions per user.
- **Retention:** 7-day retention ≥40%, streak drop-offs reduced by 20%.
- **Content Coverage:** 80% of top 500 prompts have human-recorded audio within 60 days.
- **Performance:** 1st input delay <75ms on Home/Practice, audio start latency <150ms on Wi-Fi.
- **Qualitative:** SUS score >80 from beta testers; positive sentiment on visual polish and motivation.

## 10. Dependencies & Risks
- Need buy-in for dedicated design resources (Figma system + motion). Without it, component consistency will lag.
- Audio storage and processing add infra cost; plan monthly budget and observability (S3, worker logs).
- Gamification elements (currency, shop) require product safeguards to avoid overwhelming new learners—consider progressive disclosure.
- Localization: ensure new strings exist in `messages/*.json` and audio metadata supports both English and Macedonian UI labels.

By following this plan, Македонски • MK Language Lab will deliver a mission-driven, audio-rich, and delightfully gamified experience that stands alongside Duolingo and Clozemaster while celebrating its unique cultural identity.
