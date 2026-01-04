# Македонски • MK Language Lab 🇲🇰

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com)

A modern, mobile-first language learning platform for Macedonian. Built with Next.js 15 App Router, featuring structured learning paths, interactive practice sessions, a bilingual reader, and gamification elements inspired by Duolingo and ClozeMaster.

**Live at:** [mklanguage.com](https://mklanguage.com)

---

## 📜 Open Source + Content Notice

| Component | License | Notes |
|-----------|---------|-------|
| **Source Code** | [MIT](./LICENSE) | Free to use, modify, and distribute |
| **Brand & Name** | Proprietary | "MKLanguage" name/logo not licensed for reuse |
| **Lesson Content** | Proprietary | Educational content in `data/` is not open source |

See [DISCLAIMER.md](./DISCLAIMER.md) for full details on content restrictions.

---

## ✨ Features

### 📖 Learning Paths
- **A1 Foundations** - Master the basics with 14 structured lessons covering alphabet, greetings, numbers, and everyday vocabulary
- **A2 Intermediate** - Build on your foundation with more complex grammar and vocabulary
- **B1-C1 Advanced** - Deep dive into Macedonian with advanced topics (Pro feature)
- **30-Day Reading Challenge** - Read "The Little Prince" (Малиот принц) in Macedonian, one chapter at a time

### 🎯 Practice Modes
- **Vocabulary Drills** - Multiple choice and typing exercises with 500+ curated phrases
- **Topic Packs** - Focused vocabulary modules: Household, Weather, Health, Hobbies, Clothing, Technology, Numbers, Celebrations
- **Word Sprint** - Quick-fire practice sessions for rapid vocabulary building
- **Grammar Lessons** - Interactive exercises covering Macedonian grammar rules

### 📚 Reader
- **Curated Readings** - Short texts at various difficulty levels (A1-B2)
- **Tap-to-Translate** - Tap any word for instant translation and audio
- **Vocabulary Building** - Save words to your personal collection
- **30-Day Challenge** - Structured reading program based on "The Little Prince"

### 🔄 Translation Tools
- **Bidirectional Translation** - Macedonian ↔ English powered by Google Cloud
- **Translation History** - Save and review past translations
- **Saved Phrases** - Build your personal phrase book

### 🎮 Gamification
- **XP & Streaks** - Track daily progress and maintain learning streaks
- **Daily Goals** - Set and achieve daily XP targets
- **Achievements** - Unlock badges for milestones
- **Leaderboards** - Compete with other learners

### 🌍 Bilingual Interface
- Full English and Macedonian UI
- Language detection and auto-switching
- Native Cyrillic keyboard support

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- (Optional) PostgreSQL for production
- (Optional) Google Cloud account for translation API

### Installation

```bash
# Clone the repository
git clone https://github.com/battaglia-v/mk-language-lab.git
cd mk-language-lab

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Initialize database
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Visit http://localhost:3000/en (or /mk) to explore the app.

### Required Environment Variables

Create `.env.local` with:

```bash
# Database
DATABASE_URL="file:./dev.db"  # SQLite for development

# Authentication
AUTH_SECRET="your-secret-key"
AUTH_GOOGLE_ID="google-oauth-client-id"
AUTH_GOOGLE_SECRET="google-oauth-client-secret"

# Google Cloud Translation (Optional)
GOOGLE_PROJECT_ID="your-gcp-project"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"

# OpenAI (Optional - for AI tutor)
OPENAI_API_KEY="your-openai-key"
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Database:** Prisma ORM (SQLite dev, PostgreSQL production)
- **Auth:** NextAuth.js v5 (Google, Facebook, Credentials)
- **APIs:** Google Cloud Translate, OpenAI GPT-4
- **i18n:** next-intl
- **Testing:** Vitest, Playwright E2E
- **Deployment:** Vercel

## 📱 Mobile Support

The app is designed mobile-first with:
- Progressive Web App (PWA) capabilities
- Touch-optimized UI components
- Offline vocabulary caching
- Android/iOS home screen installation

## 📂 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── learn/         # Learning paths
│   │   ├── practice/      # Practice sessions
│   │   ├── reader/        # Reading library
│   │   └── translate/     # Translation tool
│   └── api/               # API routes
├── components/            # React components
│   ├── learn/            # Learning path components
│   ├── practice/         # Practice session components
│   ├── reader/           # Reader components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and helpers
├── data/                  # Static content (decks, samples)
├── prisma/               # Database schema
└── docs/                 # Documentation
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run Vitest tests
npm run test:e2e     # Run Playwright E2E tests
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for Macedonian language learners**
