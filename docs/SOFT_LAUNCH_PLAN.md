# Soft Launch & Feedback Loop Plan

## Overview
A soft launch allows us to test the app with a limited audience, collect feedback, and identify issues before the public launch. This phased approach reduces risk and ensures a polished experience for the wider audience.

---

## Soft Launch Strategy

### Phase 1: Internal Testing (Week 1)
**Audience:** Team members, close friends, family
**Goal:** Catch obvious bugs and UX issues
**Size:** 5-10 people

**Distribution Method:**
- Google Play Internal Testing track
- Direct APK sharing (if needed)
- Credentials provided for test accounts

**Testing Focus:**
- [ ] App installs and launches successfully
- [ ] No immediate crashes
- [ ] Core flows work (practice, lessons, news)
- [ ] Authentication works
- [ ] Data syncs properly

**Feedback Collection:**
- Slack/Discord channel for real-time feedback
- Quick bug report form (see template below)

---

### Phase 2: Closed Beta (Week 2-3)
**Audience:** Macedonian language learners, early adopters
**Goal:** Validate learning experience and content quality
**Size:** 50-100 people

**Recruitment:**
- Post in Macedonian language learning groups (Reddit, Facebook)
- Reach out to linguistics students
- Language exchange communities
- Personal networks with Macedonian heritage

**Distribution Method:**
- Google Play Closed Testing track
- Share opt-in link
- Require Google account for tracking

**Testing Focus:**
- [ ] Learning progression feels natural
- [ ] Grammar explanations are clear
- [ ] Practice difficulty is appropriate
- [ ] Audio quality is acceptable (TTS limitations noted)
- [ ] News content is engaging

**Feedback Collection:**
- In-app feedback form (lightweight)
- Weekly survey (optional)
- Google Play reviews (private, beta-only)

---

### Phase 3: Open Beta (Week 4-6)
**Audience:** General public, but clearly marked as "Beta"
**Goal:** Stress test, gather diverse feedback, build early community
**Size:** 500-1000 people

**Distribution Method:**
- Google Play Open Testing track
- Listed in Play Store with "Beta" tag
- Social media promotion
- Language learning forums

**Testing Focus:**
- [ ] Server load handling
- [ ] Performance across devices
- [ ] Edge cases and unusual workflows
- [ ] Localization quality (Macedonian translations)
- [ ] Monetization readiness (if applicable)

**Feedback Collection:**
- In-app feedback widget
- Google Play reviews (public but marked as beta)
- Analytics dashboard monitoring
- Community Discord/forum

---

## Metrics to Watch

### Technical Health
**Critical (Must be green before public launch):**
- Crash-free rate: >99%
- ANR (App Not Responding) rate: <0.5%
- Startup time: <2 seconds on mid-range devices
- API error rate: <1%

**Important (Should be monitored):**
- Average session length: Target 5-10 minutes
- Page load time: <500ms for most screens
- Memory usage: <200 MB on average

### User Engagement
**Watch for red flags:**
- Drop-off rate: If >50% don't complete first practice session
- Retention (Day 1): Target >40%
- Retention (Day 7): Target >20%
- Practice completion rate: Target >70%

**Positive signals:**
- Multiple practice sessions per user
- Grammar lessons accessed (not just practice)
- News articles read
- Custom decks created
- Phrases saved from translator

### Content Quality
**Audio feedback:**
- TTS audio complaint rate: Track mentions of "robot voice", "unnatural", etc.
- Expected: Some negative feedback (we're transparent about TTS)
- Red flag: >30% of feedback is negative about audio

**Grammar quality:**
- Users report errors in explanations: Track specific reports
- Red flag: >5 unique grammar errors reported

**News content:**
- Engagement with news section: Target >30% of users visit
- Red flag: Users report outdated/broken articles

---

## Feedback Collection Methods

### 1. In-App Feedback Widget (PRIMARY METHOD)

**Implementation:**
Add a lightweight feedback button visible on key screens:
- Dashboard (bottom right corner)
- Practice completion modal
- Grammar lesson view
- Settings page

**Feedback Form:**
```
┌─────────────────────────────────────┐
│  Something feel off? Let us know.   │
├─────────────────────────────────────┤
│                                     │
│  What's your feedback?              │
│  ┌─────────────────────────────┐   │
│  │ [Text area - 500 char max]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Optional] Where did you notice?   │
│  [ Practice ] [ Grammar ] [ News ]  │
│  [ Translator ] [ Other ]           │
│                                     │
│  [ Send Feedback ]    [ Cancel ]    │
│                                     │
└─────────────────────────────────────┘
```

**Data Captured:**
- Feedback text
- Screen/section tag
- User ID (anonymized if desired)
- Timestamp
- App version
- Device info (OS, model)

**Storage:**
- Store in database (Prisma schema needed)
- Admin dashboard to view feedback
- Email notifications for critical feedback (optional)

**Non-intrusive Triggers:**
- Available anytime via "Feedback" button
- Optional: Gentle prompt after 5+ practice sessions: "How's it going? Got feedback?"
- Never interrupt core flows

---

### 2. Post-Session Micro-Survey (OPTIONAL, USE SPARINGLY)

**Trigger:** After 3rd, 7th, and 15th completed practice session
**Format:** Single question, 5 seconds to answer

**Examples:**
- "How would you rate today's practice session?" [1-5 stars]
- "Was the difficulty level right for you?" [Too easy / Just right / Too hard]
- "Did you learn something new today?" [Yes / No]

**Rules:**
- Max 1 question per session
- Skippable with single tap
- Never shown more than once per day
- Can be dismissed permanently

---

### 3. Weekly Check-in Email (OPTIONAL)

**Audience:** Beta users who opted in
**Frequency:** Weekly during beta period
**Content:**
- "How was your week learning Македонски?"
- 2-3 specific questions
- Link to longer survey (optional)
- Acknowledge previous feedback: "Thanks for reporting X, we fixed it!"

**Sample Questions:**
1. What feature did you use most this week?
2. What was frustrating or confusing?
3. What would you like to see next?

---

### 4. Analytics Event Tracking

**Key Events to Track:**
```javascript
// Session events
practiceSessionStarted
practiceSessionCompleted
practiceSessionAbandoned (if <50% complete)

// Content engagement
grammarLessonViewed
newsArticleOpened
customDeckCreated
translatorUsed

// Errors
audioPlaybackFailed
apiRequestFailed
imageLoadFailed

// Feedback
feedbackSubmitted
reviewPromptShown
reviewPromptAccepted
reviewPromptDismissed
```

**Analytics Platform:**
- Vercel Analytics (already integrated via `@vercel/analytics`)
- Google Analytics (if needed for deeper funnels)
- Sentry (error tracking - already integrated)

**Dashboard Monitoring:**
- Set up alerts for critical errors
- Weekly report on key metrics
- Funnel analysis (dashboard → practice → completion)

---

## Feedback Response Protocol

### Triage Priority

**P0 - Critical (Fix immediately):**
- App crashes on launch
- Cannot complete authentication
- Data loss (progress not saved)
- Payment issues (if applicable)
- Security vulnerabilities

**P1 - High (Fix within 48 hours):**
- Feature completely broken
- Incorrect grammar explanations
- Broken news articles
- Audio fails to play consistently

**P2 - Medium (Fix within 1 week):**
- UI glitches
- Confusing UX
- Minor translation errors
- Slow performance

**P3 - Low (Backlog):**
- Feature requests
- "Nice to have" improvements
- Cosmetic issues

### Response Timeline
- Acknowledge all feedback within 24 hours (automated email)
- Respond to critical issues within 4 hours
- Update users when their reported issue is fixed

---

## Soft Launch Checklist

### Pre-Launch (Before Internal Testing)
- [ ] App builds without errors
- [ ] Basic smoke tests pass
- [ ] Test accounts created
- [ ] Feedback form implemented
- [ ] Analytics events tracking correctly
- [ ] Sentry error reporting configured
- [ ] Internal testing group invited
- [ ] Feedback collection channel set up (Slack/Discord)

### Before Closed Beta
- [ ] No P0 issues from internal testing
- [ ] Major P1 issues resolved
- [ ] Google Play Closed Testing track configured
- [ ] Beta opt-in link created
- [ ] Recruitment message posted in communities
- [ ] In-app feedback widget tested
- [ ] Analytics dashboard reviewed

### Before Open Beta
- [ ] No P0 or P1 issues outstanding
- [ ] Crash-free rate >98%
- [ ] Performance benchmarks met
- [ ] Content validated (no broken links, images, etc.)
- [ ] Open Testing track configured
- [ ] Beta tag clearly visible in store listing
- [ ] Community channels active (Discord/forum)
- [ ] Team bandwidth for support requests

### Before Public Launch
- [ ] No critical issues from open beta
- [ ] User feedback overwhelmingly positive (>70% thumbs up)
- [ ] Core metrics healthy (see "Metrics to Watch")
- [ ] All required Play Store assets ready
- [ ] Privacy policy and support email configured
- [ ] Review trigger tested and working
- [ ] Final app screenshots captured
- [ ] Go/No-Go decision meeting held

---

## Community Building During Beta

### Engagement Strategy
1. **Create a feedback space:**
   - Discord server or Subreddit
   - Encourage beta users to join
   - Share updates, changelogs, and sneak peeks

2. **Acknowledge contributors:**
   - Thank beta testers publicly (with permission)
   - Credit bug reporters in release notes
   - Offer early access to new features

3. **Be transparent:**
   - Share roadmap openly
   - Explain why certain feedback can't be implemented yet
   - Be honest about TTS limitations

4. **Build excitement:**
   - Tease upcoming features
   - Share milestones (e.g., "1,000 practice sessions completed!")
   - Celebrate the community

---

## Sample Feedback Form Code

**Prisma Schema Addition:**
```prisma
model Feedback {
  id        String   @id @default(cuid())
  userId    String?
  message   String   @db.Text
  category  String?  // practice, grammar, news, translator, other
  screen    String?  // URL or screen identifier
  appVersion String?
  deviceInfo String?
  createdAt DateTime @default(now())
  status    String   @default("new") // new, acknowledged, in-progress, resolved

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}
```

**API Route:**
```typescript
// app/api/feedback/route.ts
export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();

  const feedback = await prisma.feedback.create({
    data: {
      userId: session?.user?.id,
      message: body.message,
      category: body.category,
      screen: body.screen,
      appVersion: body.appVersion,
      deviceInfo: body.deviceInfo,
    },
  });

  // Optional: Send email notification for critical feedback
  // if (body.category === 'critical') {
  //   await sendFeedbackEmail(feedback);
  // }

  return Response.json({ success: true, id: feedback.id });
}
```

**React Component:**
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        category,
        screen: window.location.pathname,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
        deviceInfo: navigator.userAgent,
      }),
    });
    setSubmitting(false);
    setOpen(false);
    setMessage('');
    setCategory(null);
    // Show success toast
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Feedback
      </Button>
      {/* Modal implementation here */}
    </>
  );
}
```

---

## Red Flags & Kill Switches

### When to Pause/Rollback Beta

**Immediate pause if:**
- Crash rate >5%
- Data loss reported by multiple users
- Security vulnerability discovered
- Widespread feature breakage

**Consider rollback if:**
- Negative feedback >50% of total
- Drop-off rate >70% on first session
- Multiple reports of offensive/inappropriate content
- Legal/compliance issues arise

**Rollback Process:**
1. Pause new sign-ups
2. Post notice in community channels
3. Investigate and fix issue
4. Deploy patch
5. Resume beta with apology + explanation

---

## Success Criteria for Public Launch

**Go/No-Go Decision based on:**

✅ **Technical Stability**
- Crash-free rate >99%
- No critical bugs
- Performance within targets

✅ **User Feedback**
- Positive sentiment >70%
- <10 critical usability issues reported
- TTS audio complaints within expected range

✅ **Engagement Metrics**
- Day 1 retention >35%
- Average session length >4 minutes
- Practice completion rate >60%

✅ **Content Quality**
- No major grammar errors
- News articles loading reliably
- Audio playback working

✅ **Business Readiness**
- Store listing complete and approved
- Support infrastructure ready
- Team bandwidth for launch spike

---

*Last Updated: 2025-12-15*
