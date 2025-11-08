# Andri Content Import Format Guide
**For:** macedonianlanguagecorner@gmail.com
**Purpose:** Bulk uploading Macedonian vocabulary and phrases

---

## 📋 Current Database Schema

Our `practiceVocabulary` table currently supports these fields:

### ✅ Core Fields (Required)
- **macedonian** (String) - The word/phrase in Macedonian Cyrillic
- **english** (String) - The English translation

### ✅ Optional Fields (Currently Supported)
- **category** (String) - Topic/theme (e.g., "greetings", "food", "family", "travel")
- **difficulty** (String) - One of: "beginner", "intermediate", "advanced"
- **pronunciation** (String) - Romanized/Latin pronunciation guide (e.g., "zdravo")
- **partOfSpeech** (String) - E.g., "noun", "verb", "phrase", "greeting", "expression"
- **exampleMk** (Text) - Example sentence in Macedonian
- **exampleEn** (Text) - Example sentence in English
- **icon** (String) - Emoji icon for visual association (e.g., "👋", "🍕", "👨‍👩‍👧")

---

## 📝 Recommended Import Format (CSV or JSON)

### Option A: Simple CSV Format
Perfect for vocabulary lists without examples:

```csv
macedonian,english,category,difficulty,pronunciation,partOfSpeech,icon
Здраво,Hello,greetings,beginner,zdravo,greeting,👋
Како си?,How are you?,greetings,beginner,kako si,phrase,💬
Денес,Today,time,beginner,denes,noun,📅
```

### Option B: Extended JSON Format
Best for phrases with context and examples:

```json
[
  {
    "macedonian": "Денес му е роденден на Иван.",
    "english": "Today is Ivan's birthday.",
    "category": "family",
    "difficulty": "beginner",
    "pronunciation": "denes mu e rodenden na Ivan",
    "partOfSpeech": "phrase",
    "exampleMk": "Денес му е роденден на Иван. Ќе одам на прослава.",
    "exampleEn": "Today is Ivan's birthday. I will go to the celebration.",
    "icon": "🎂"
  },
  {
    "macedonian": "Добро утро",
    "english": "Good morning",
    "category": "greetings",
    "difficulty": "beginner",
    "pronunciation": "dobro utro",
    "partOfSpeech": "greeting",
    "icon": "🌅"
  }
]
```

### Option C: Google Sheets Template
Easiest for collaborative editing:

| macedonian | english | category | difficulty | pronunciation | partOfSpeech | exampleMk | exampleEn | icon |
|------------|---------|----------|------------|---------------|--------------|-----------|-----------|------|
| Здраво | Hello | greetings | beginner | zdravo | greeting | Здраво! Како си? | Hello! How are you? | 👋 |
| Денес | Today | time | beginner | denes | noun | Денес е убав ден. | Today is a beautiful day. | 📅 |

---

## 🎯 Mapping Your Format to Ours

Based on your proposed format, here's how it maps:

| Your Field | Our Field | Notes |
|------------|-----------|-------|
| macedonian | macedonian | ✅ Direct match |
| english | english | ✅ Direct match |
| context | category + exampleMk/exampleEn | We'll use category for topic, and examples for usage context |
| formality | ❌ Not yet supported | See "Future Enhancements" below |
| pronunciation | pronunciation | ✅ Supported (optional) |
| audio | ❌ Not yet supported | See "Future Enhancements" below |
| pictures | icon | ✅ Supported (emojis only for now) |

### How to Handle "Context" and "Formality"
Since you proposed:
- **context:** "Used to inform someone about Ivan's birthday, often in casual conversations or greetings."
- **formality:** "neutral"

We recommend:
1. **Context** → Use `exampleMk` and `exampleEn` for usage examples
2. **Formality** → Use `category` with values like "formal-greetings", "informal-greetings", or add notes in examples

**Example:**
```json
{
  "macedonian": "Добар ден",
  "english": "Good day",
  "category": "formal-greetings",
  "exampleMk": "Добар ден, господине. Како можам да ви помогнам?",
  "exampleEn": "Good day, sir. How can I help you?",
  "icon": "🤵"
}
```

---

## 🚀 Future Enhancements (Phase 2)

### Features We Want to Add Based on Your Suggestions:

#### 1. **Formality Field** (High Priority)
Add explicit formality tracking:
- Values: "formal", "neutral", "informal"
- Helps learners choose appropriate language for context

#### 2. **Audio Pronunciation** (High Priority)
- Store audio file URLs (MP3/WAV)
- Link to your Makedonkast podcast clips
- Native speaker recordings for accurate pronunciation

#### 3. **Image Association** (Medium Priority)
- Replace emoji icons with actual images
- Support for comprehensible input (pictures + descriptions)
- Visual learning aids

#### 4. **Usage Context** (Medium Priority)
- Separate field for contextual usage notes
- Different from example sentences
- Explains when/why to use the phrase

---

## 📦 Bulk Import Process

### Step 1: Choose Your Format
Pick the format that works best for you:
- **Google Sheets:** Easiest to edit, we'll export to CSV
- **CSV File:** Direct upload to admin panel
- **JSON File:** Most flexible, best for complex data

### Step 2: Fill in Content
- Minimum required: `macedonian` + `english`
- Recommended: Add `category`, `difficulty`, `pronunciation`
- Optional: Add examples, icons, part of speech

### Step 3: Submit for Review
Options:
1. **Share Google Sheet** with us for review
2. **Upload CSV** directly in admin panel (coming soon)
3. **Send JSON file** for bulk import

### Step 4: We Import & Review
- We'll run validation checks
- Fix any formatting issues
- Preview before going live

---

## 🎨 Category Guidelines

Use these standardized categories for consistency:

### Everyday Basics
- `greetings` - Hello, goodbye, how are you
- `politeness` - Please, thank you, excuse me
- `numbers` - Counting, quantities
- `time` - Days, months, clock time
- `weather` - Weather descriptions

### People & Relationships
- `family` - Family members, relationships
- `people` - Describing people, occupations
- `emotions` - Feelings and states

### Daily Life
- `food` - Food, drinks, restaurants
- `shopping` - Buying, prices, stores
- `health` - Body parts, medical, feelings
- `activities` - Daily routines, hobbies

### Places & Travel
- `places` - Locations, buildings
- `travel` - Transportation, directions
- `transport` - Vehicles, tickets

### Work & Culture
- `work` - Jobs, office, business
- `culture` - Traditions, celebrations
- `questions` - Common question phrases

Or create your own categories! These are just suggestions.

---

## 💡 Tips for Best Results

### 1. **Pronunciation Guidelines**
Use simplified Latin script:
- ж → zh (жена → zhena)
- ч → ch (чај → chaj)
- ш → sh (шеќер → sheker)
- љ → lj (љубов → ljubov)
- њ → nj (њој → njoj)
- ќ → kj (ќе → kje)
- ѓ → gj (ѓаво → gjavo)

### 2. **Icon Selection**
Choose emojis that visually represent the concept:
- 👋 Greetings
- 🍕 Food
- 👨‍👩‍👧 Family
- 🚗 Transport
- 🏥 Health
- ❤️ Emotions
- ⏰ Time

### 3. **Example Sentences**
Make examples:
- Natural and commonly used
- Slightly longer than the word/phrase itself
- Show practical context
- Include variety (statements, questions, responses)

### 4. **Difficulty Levels**
- **Beginner:** High-frequency daily words, basic greetings
- **Intermediate:** Work vocabulary, complex topics, idioms
- **Advanced:** Formal language, cultural nuances, specialized terms

---

## 📊 Sample Complete Entry

Here's a fully-filled example:

```json
{
  "macedonian": "Колку чини ова?",
  "english": "How much does this cost?",
  "category": "shopping",
  "difficulty": "beginner",
  "pronunciation": "kolku chini ova",
  "partOfSpeech": "phrase",
  "exampleMk": "Колку чини ова? - Триста денари.",
  "exampleEn": "How much does this cost? - Three hundred denars.",
  "icon": "💰"
}
```

**What makes this good:**
✅ Clear translation
✅ Practical category
✅ Accurate difficulty level
✅ Simple pronunciation guide
✅ Natural example with response
✅ Relevant emoji

---

## 🤝 Next Steps

1. **Access Admin Panel:** Log in at `https://mk-language-lab.vercel.app/admin`
2. **Review Current Vocabulary:** See our existing 385 entries
3. **Choose Format:** Pick CSV, JSON, or Google Sheets
4. **Start Small:** Try importing 10-20 entries first
5. **Give Feedback:** Let us know what fields/features you need

We're excited to integrate your authentic content! Let us know if you need any clarification on the format or have suggestions for new fields.

---

**Questions?** Email vincent@[domain] or reply in our shared channel.
